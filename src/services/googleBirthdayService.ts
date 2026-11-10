import { supabase } from '@/config/supabase'

const pendingKey = 'dareklist.googleBirthdayUser'
export const googleBirthdayScope = 'openid email profile https://www.googleapis.com/auth/user.birthday.read'
export const googleLoginPendingKey = 'dareklist.googleLoginBirthday'

export async function requestGoogleBirthday(userId: string, email?: string): Promise<void> {
  sessionStorage.setItem(pendingKey, userId)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent('/settings?googleBirthday=1')}`,
      scopes: googleBirthdayScope,
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
  return fetchGoogleBirthday(token)
}

export async function fetchGoogleBirthday(token: string | null | undefined): Promise<string | null> {
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

export async function saveMissingGoogleBirthday(userId: string, token: string | null | undefined): Promise<void> {
  const { data, error } = await supabase.from('profile_dates').select('birth_date').eq('user_id', userId).maybeSingle()
  if (error) throw error
  if (data?.birth_date) return
  const birthday = await fetchGoogleBirthday(token)
  if (!birthday) return
  if (data) {
    const { error: updateError } = await supabase.from('profile_dates').update({ birth_date: birthday }).eq('user_id', userId).is('birth_date', null)
    if (updateError) throw updateError
  } else {
    const { error: insertError } = await supabase.from('profile_dates').insert({ user_id: userId, birth_date: birthday })
    if (insertError && insertError.code !== '23505') throw insertError
  }
  window.dispatchEvent(new Event('profile-dates-changed'))
}
