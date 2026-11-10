import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'

export function Settings() {
  const { user } = useAuth()
  const [birthDate, setBirthDate] = useState('')
  const [nameDay, setNameDay] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let active = true
    supabase.from('profile_dates').select('birth_date, name_day').eq('user_id', user.id).maybeSingle()
      .then(({ data, error: loadError }) => {
        if (!active) return
        if (loadError) {
          console.error('Failed to load profile dates:', loadError)
          setLoadFailed(true)
          setError('Údaje se nepodařilo načíst. Zkuste to prosím později.')
        } else {
          setBirthDate(data?.birth_date || '')
          setNameDay(data?.name_day?.slice(5) || '')
        }
        setLoading(false)
      })
    return () => { active = false }
  }, [user])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const { error: saveError } = await supabase.from('profile_dates').upsert({
        user_id: user.id, birth_date: birthDate || null, name_day: nameDay ? `2000-${nameDay}` : null,
      })
      if (saveError) throw saveError
      setMessage('Údaje byly uloženy.')
    } catch (saveError) {
      console.error('Failed to save profile dates:', saveError)
      setError('Údaje se nepodařilo uložit. Zkontrolujte datum a zkuste to znovu.')
    } finally {
      setSaving(false)
    }
  }

  const today = new Date()
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return <Layout><div className="max-w-xl mx-auto w-full">
    <Link to="/wishlists" className="text-primary-600 hover:underline">← Moje seznamy</Link>
    <h1 className="text-3xl font-bold mt-4 mb-2">Nastavení profilu</h1>
    <p className="text-gray-600 mb-6">Narozeniny a svátek uvidí přihlášení uživatelé, se kterými sdílíte seznam. Údaje jsou nepovinné.</p>
    <form onSubmit={save} className="bg-white rounded-lg border p-6 space-y-5">
      <div><label htmlFor="birth-date" className="block font-medium mb-1">Datum narození</label>
        <input id="birth-date" type="date" min="1900-01-01" max={maxDate} value={birthDate} onChange={e => setBirthDate(e.target.value)} className="border rounded-md p-2 w-full" /></div>
      <div><label htmlFor="name-day" className="block font-medium mb-1">Datum svátku</label>
        <input id="name-day" type="date" min="2000-01-01" max="2000-12-31" value={nameDay ? `2000-${nameDay}` : ''} onChange={e => setNameDay(e.target.value.slice(5))} className="border rounded-md p-2 w-full" />
        <p className="text-sm text-gray-500 mt-1">Vyberte den a měsíc; rok 2000 slouží pouze pro zadání data.</p></div>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {message && <p role="status" className="text-green-700">{message}</p>}
      <button className="btn-primary" disabled={loading || saving || loadFailed}>{saving ? 'Ukládání…' : 'Uložit'}</button>
    </form>
  </div></Layout>
}
