import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Gift } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function handleAuthCallback() {
      try {
        // Zkontrolovat chyby z URL
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorParam) {
          setError(errorDescription || errorParam)
          return
        }

        // Počkat na dokončení auth procesu
        if (!loading && mounted) {
          if (user) {
            console.log('✅ Auth callback - uživatel přihlášen:', user.email)
            const returnTo = searchParams.get('returnTo') || '/wishlists'
            // Použít window.location místo navigate pro jistotu
            window.location.href = returnTo
            return
          } else {
            console.log('⏳ Auth callback - čekání na session...')
            // Počkat ještě chvíli
            setTimeout(() => {
              if (mounted && !user) {
                console.log('❌ Auth callback - session se nenastavila')
                setError('Problém s přihlášením. Zkuste to znovu.')
              }
            }, 3000)
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Neočekávaná chyba při přihlašování')
      }
    }

    handleAuthCallback()

    return () => {
      mounted = false
    }
  }, [user, loading, navigate, searchParams])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chyba při přihlašování
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Dokončování přihlášení...
        </h2>
        <p className="text-gray-600">
          {user ? 'Přesměrování...' : 'Ověřování účtu...'}
        </p>
      </div>
    </div>
  )
}