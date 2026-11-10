import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useBlocker, useSearchParams } from 'react-router-dom'
import { getDateByName } from '@/utils/nameDays'
import { Layout } from '@/components/Layout'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { readGoogleBirthday, requestGoogleBirthday } from '@/services/googleBirthdayService'

export function Settings() {
  const { user, session } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [importing, setImporting] = useState(false)
  const importPromise = useRef<Promise<string | null> | null>(null)
  const redirectingToGoogle = useRef(false)
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
  const blocker = useBlocker(({ currentLocation, nextLocation }) => (dirty || saving) && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (!saving && window.confirm('Máte neuložené změny. Opravdu chcete odejít bez uložení?')) blocker.proceed()
    else blocker.reset()
  }, [blocker, saving])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (redirectingToGoogle.current || (!dirty && !saving)) return
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
          let draft: { birthDate: string; nameDay: string } | null = null
          const draftKey = `dareklist.profileDraft.${user.id}`
          try { draft = JSON.parse(sessionStorage.getItem(draftKey) || 'null') } catch { console.error('Invalid profile draft') }
          sessionStorage.removeItem(draftKey)
          setBirthDate(typeof draft?.birthDate === 'string' ? draft.birthDate : savedBirthDate)
          const profileName = String(user.user_metadata?.given_name || user.user_metadata?.full_name || user.user_metadata?.display_name || '').trim().split(/\s+/)[0]
          const matches = profileName ? getDateByName(profileName) : []
          setNameDay(typeof draft?.nameDay === 'string' ? draft.nameDay : savedNameDay || (matches.length === 1 ? matches[0] : ''))
        }
        setLoading(false)
      })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (loading || !user || searchParams.get('googleBirthday') !== '1') return
    let active = true
    setImporting(true)
    if (!importPromise.current) importPromise.current = readGoogleBirthday(user.id, session?.provider_token)
    importPromise.current.then(date => {
      if (!active) return
      if (date) {
        setBirthDate(date)
        setMessage('Datum narození bylo načteno z Googlu. Zkontrolujte ho a uložte.')
      } else {
        setError('Google nevrátil úplné datum narození. Doplňte ho ve svém Google účtu nebo ho zadejte ručně zde.')
      }
    }).catch(importError => {
      console.error('Google birthday import failed:', importError)
      if (active) setError('Datum z Googlu se nepodařilo načíst. Zkontrolujte oprávnění nebo jej zadejte ručně. Pokud jste zvolili jiný účet, přihlaste se zpět ke svému účtu.')
    }).finally(() => {
      if (active) { setImporting(false); importPromise.current = null; setSearchParams({}, { replace: true }) }
    })
    return () => { active = false }
  }, [loading, user, session, searchParams, setSearchParams])

  const importBirthday = async () => {
    if (!user) return
    setError('')
    try {
      sessionStorage.setItem(`dareklist.profileDraft.${user.id}`, JSON.stringify({ birthDate, nameDay }))
      redirectingToGoogle.current = true
      await requestGoogleBirthday(user.id, user.email)
    } catch (importError) {
      redirectingToGoogle.current = false
      sessionStorage.removeItem(`dareklist.profileDraft.${user.id}`)
      console.error('Failed to start Google birthday import:', importError)
      setError('Propojení s Googlem se nepodařilo spustit. Datum můžete zadat ručně.')
    }
  }

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
        <input id="birth-date" type="date" min="1900-01-01" max={maxDate} value={birthDate} onChange={e => setBirthDate(e.target.value)} className="border rounded-md p-2 w-full" />
        {!birthDate && !loading && <p className="text-sm text-amber-700 mt-2">Datum narození zatím nemáte vyplněné. Můžete ho načíst z Googlu nebo zadat ručně.</p>}
        {user?.app_metadata?.providers?.includes('google') && <div className="mt-3">
          <button type="button" onClick={importBirthday} disabled={loading || saving || importing || loadFailed} className="border border-primary-600 text-primary-700 rounded-md px-3 py-2 disabled:opacity-50">{importing ? 'Načítání…' : 'Načíst z Google účtu'}</button>
          <p className="text-sm text-gray-500 mt-1">Google vás požádá o souhlas s přístupem k datu narození.</p>
        </div>}</div>
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
