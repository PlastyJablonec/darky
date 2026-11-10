import { FormEvent, useEffect, useState } from 'react'
import { Link, useBlocker } from 'react-router-dom'
import { getDateByName } from '@/utils/nameDays'
import { Layout } from '@/components/Layout'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'

export function Settings() {
  const { user } = useAuth()
  const [birthDate, setBirthDate] = useState('')
  const [nameDay, setNameDay] = useState('')
  const [savedDates, setSavedDates] = useState({ birthDate: '', nameDay: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const firstName = String(user?.user_metadata?.given_name || user?.user_metadata?.full_name || user?.user_metadata?.display_name || '').trim().split(/\s+/)[0]
  const suggestions = firstName ? getDateByName(firstName) : []
  const dirty = !loading && (birthDate !== savedDates.birthDate || nameDay !== savedDates.nameDay)
  const blocker = useBlocker(dirty || saving)

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (!saving && window.confirm('Máte neuložené změny. Opravdu chcete odejít bez uložení?')) blocker.proceed()
    else blocker.reset()
  }, [blocker, saving])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty && !saving) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, saving])

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
          const savedBirthDate = data?.birth_date || ''
          const savedNameDay = data?.name_day?.slice(5) || ''
          setSavedDates({ birthDate: savedBirthDate, nameDay: savedNameDay })
          setBirthDate(savedBirthDate)
          const profileName = String(user.user_metadata?.given_name || user.user_metadata?.full_name || user.user_metadata?.display_name || '').trim().split(/\s+/)[0]
          const matches = profileName ? getDateByName(profileName) : []
          setNameDay(savedNameDay || (matches.length === 1 ? matches[0] : ''))
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
      setSavedDates({ birthDate, nameDay })
      setMessage('Údaje byly uloženy.')
    } catch (saveError) {
      console.error('Failed to save profile dates:', saveError)
      setError('Údaje se nepodařilo uložit. Zkontrolujte datum a zkuste to znovu.')
    } finally {
      setSaving(false)
    }
  }

  const changeNameDay = (part: 'day' | 'month', value: string) => {
    if (!value) { setNameDay(''); return }
    const month = part === 'month' ? Number(value) : Number(nameDay.slice(0, 2) || 1)
    const selectedDay = part === 'day' ? Number(value) : Number(nameDay.slice(3) || 1)
    const day = Math.min(selectedDay, new Date(2000, month, 0).getDate())
    setNameDay(`${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
  }
  const monthNames = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec']
  const daysInMonth = new Date(2000, Number(nameDay.slice(0, 2)) || 1, 0).getDate()
  const today = new Date()
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return <Layout><div className="max-w-xl mx-auto w-full">
    <Link to="/wishlists" className="text-primary-600 hover:underline">← Moje seznamy</Link>
    <h1 className="text-3xl font-bold mt-4 mb-2">Nastavení profilu</h1>
    <p className="text-gray-600 mb-6">Narozeniny a svátek uvidí přihlášení uživatelé, se kterými sdílíte seznam. Údaje jsou nepovinné.</p>
    <form onSubmit={save} className="bg-white rounded-lg border p-6 space-y-5">
      <div><label htmlFor="birth-date" className="block font-medium mb-1">Datum narození</label>
        <input id="birth-date" type="date" min="1900-01-01" max={maxDate} value={birthDate} onChange={e => setBirthDate(e.target.value)} className="border rounded-md p-2 w-full" /></div>
      <div><span className="block font-medium mb-1">Datum svátku</span>
        <div className="flex gap-3">
          <div className="flex-1"><label htmlFor="name-day-day" className="sr-only">Den svátku</label>
            <select id="name-day-day" value={nameDay ? String(Number(nameDay.slice(3))) : ''} onChange={e => changeNameDay('day', e.target.value)} className="border rounded-md p-2 w-full bg-white">
              <option value="">Den</option>{Array.from({ length: daysInMonth }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}.</option>)}
            </select></div>
          <div className="flex-1"><label htmlFor="name-day-month" className="sr-only">Měsíc svátku</label>
            <select id="name-day-month" value={nameDay ? String(Number(nameDay.slice(0, 2))) : ''} onChange={e => changeNameDay('month', e.target.value)} className="border rounded-md p-2 w-full bg-white">
              <option value="">Měsíc</option>{monthNames.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}
            </select></div>
        </div>
        {nameDay && <button type="button" onClick={() => setNameDay('')} className="text-sm text-primary-600 underline mt-2">Vymazat datum svátku</button>}
        {suggestions.length > 0 && <div className="mt-2 text-sm text-gray-600">
          <p>Podle jména {firstName} můžete zvolit (zkontrolujte před uložením):</p>
          {suggestions.map(date => <button key={date} type="button" onClick={() => setNameDay(date)} className="text-primary-600 underline mr-3">{Number(date.slice(3))}. {Number(date.slice(0, 2))}.</button>)}
        </div>}</div>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {message && <p role="status" className="text-green-700">{message}</p>}
      <button className="btn-primary" disabled={loading || saving || loadFailed}>{saving ? 'Ukládání…' : 'Uložit'}</button>
    </form>
  </div></Layout>
}
