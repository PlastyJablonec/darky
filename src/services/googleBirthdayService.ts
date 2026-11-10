import { supabase } from '@/config/supabase'

const pendingKey = 'dareklist.googleBirthdayUser'

export async function requestGoogleBirthday(userId: string, email?: string): Promise<void> {
  sessionStorage.setItem(pendingKey, userId)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent('/settings?googleBirthday=1')}`,
      scopes: 'openid email profile https://www.googleapis.com/auth/user.birthday.read',
      queryParams: { prompt: 'consent', ...(email ? { login_hint: email } : {}) },
    },
  })
  if (error) { sessionStorage.removeItem(pendingKey); throw error }
}

interface GoogleBirthday {
  date?: { year?: number; month?: number; day?: number }
  metadata?: { primary?: boolean; source?: { type?: string } }
}

export async function readGoogleBirthday(userId: string, token: string | null | undefined): Promise<string | null> {
  const expectedUser = sessionStorage.getItem(pendingKey)
  sessionStorage.removeItem(pendingKey)
  if (!expectedUser || expectedUser !== userId) throw new Error('google-account-mismatch')
  if (!token) throw new Error('google-token-unavailable')
  const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays&sources=READ_SOURCE_TYPE_PROFILE', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(`google-people-http-${response.status}`)
  const result: { birthdays?: GoogleBirthday[] } = await response.json()
  const entries = result.birthdays || []
  const primary = entries.find(item => item.metadata?.primary) || (entries.length === 1 ? entries[0] : undefined)
  const value = primary?.date
  if (!value?.year || !value.month || !value.day) return null
  const { year, month, day } = value
  const date = new Date(Date.UTC(year, month - 1, day))
  if (year < 1900 || year > new Date().getFullYear() || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || date.getTime() > Date.now()) return null
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
