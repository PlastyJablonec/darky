import { supabase } from '@/config/supabase'
import { selectGoogleBirthday, type GoogleBirthday } from '@/utils/googleBirthday'

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

export async function readGoogleBirthday(userId: string, token: string | null | undefined): Promise<string | null> {
  const expectedUser = sessionStorage.getItem(pendingKey)
  sessionStorage.removeItem(pendingKey)
  if (!expectedUser || expectedUser !== userId) throw new Error('google-account-mismatch')
  return fetchGoogleBirthday(token)
}

export async function fetchGoogleBirthday(token: string | null | undefined): Promise<string | null> {
  if (!token) throw new Error('google-token-unavailable')
  const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(`google-people-http-${response.status}`)
  const result: { birthdays?: GoogleBirthday[] } = await response.json()
  return selectGoogleBirthday(result.birthdays || [])
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
