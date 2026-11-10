import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'

export function BirthdayReminder() {
  const { user } = useAuth()
  const [missing, setMissing] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    setMissing(false)
    setDismissed(sessionStorage.getItem(`birthday-reminder-${user.id}`) === 'dismissed')
    supabase.from('profile_dates').select('birth_date').eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
      if (error) { console.error('Failed to check birthday:', error); return }
      if (active) setMissing(!data?.birth_date)
    })
    return () => { active = false }
  }, [user])

  if (!user || !missing || dismissed) return null
  return <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 flex flex-wrap justify-between gap-3">
    <p>Nemáte vyplněné datum narození. <Link to="/settings" className="underline font-medium">Doplnit v nastavení</Link></p>
    <button type="button" onClick={() => { sessionStorage.setItem(`birthday-reminder-${user.id}`, 'dismissed'); setDismissed(true) }} className="underline">Skrýt</button>
  </div>
}
