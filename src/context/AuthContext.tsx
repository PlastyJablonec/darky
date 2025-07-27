import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/config/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      try {
        setLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error)
          } else {
            console.log('Initial session:', session?.user?.email || 'No user')
            setSession(session)
            setUser(session?.user ?? null)
          }
          setLoading(false)
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email || 'No user')
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
          
          // Po úspěšném přihlášení přesměrovat pouze pokud jsme na callback stránce
          if (event === 'SIGNED_IN' && session?.user && window.location.pathname === '/auth/callback') {
            const urlParams = new URLSearchParams(window.location.search)
            const returnTo = urlParams.get('returnTo') || '/wishlists'
            
            // Malé zpoždění pro jistotu
            setTimeout(() => {
              window.location.href = returnTo
            }, 100)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signInWithGoogle = async () => {
    // Zachovat současnou URL pro návrat
    const currentUrl = window.location.href
    const returnTo = currentUrl.includes('/login') || currentUrl.includes('/register') 
      ? new URLSearchParams(window.location.search).get('returnTo') || '/wishlists'
      : window.location.pathname + window.location.search

    // Pro lokální vývoj použij produkční URL ale označit že chceme návrat na localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const redirectOrigin = isLocalhost 
      ? 'https://darky-seznam.vercel.app' 
      : window.location.origin

    // Přidat dev flag pro localhost
    const devFlag = isLocalhost ? '&dev=true' : ''

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectOrigin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}${devFlag}`,
      },
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
  }

  const updateProfile = async (data: { displayName?: string; photoURL?: string }) => {
    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: data.displayName,
        photo_url: data.photoURL,
      },
    })

    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}