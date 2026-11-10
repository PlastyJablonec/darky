import { getDateByName } from '@/utils/nameDays'

export interface ManagedPersonFields {
  personName: string
  birthDate: string
  nameDay: string
}

export function ManagedPersonForm({ value, onChange }: { value: ManagedPersonFields; onChange: (value: ManagedPersonFields) => void }) {
  const month = Number(value.nameDay.slice(0, 2)) || 1
  const day = Number(value.nameDay.slice(3)) || 1
  const days = new Date(2000, month, 0).getDate()
  const matches = getDateByName(value.personName.trim().split(/\s+/)[0] || '')
  const changeDate = (newMonth: number, newDay: number) => onChange({ ...value, nameDay: `${String(newMonth).padStart(2, '0')}-${String(Math.min(newDay, new Date(2000, newMonth, 0).getDate())).padStart(2, '0')}` })
  const today = new Date()
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const months = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec']
  return <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
    <legend className="font-medium px-1">Osoba, pro kterou seznam spravujete</legend>
    <p className="text-sm text-gray-600">Údaje jsou nepovinné. Uvidí je přihlášení uživatelé, se kterými je seznam sdílený, včetně těch, kteří otevřou veřejný odkaz.</p>
    <div><label htmlFor="person-name" className="block text-sm font-medium mb-1">Jméno</label>
      <input id="person-name" maxLength={100} value={value.personName} onChange={e => onChange({ ...value, personName: e.target.value })} className="input" /></div>
    <div><label htmlFor="person-birthday" className="block text-sm font-medium mb-1">Datum narození</label>
      <input id="person-birthday" type="date" min="1900-01-01" max={maxDate} value={value.birthDate} onChange={e => onChange({ ...value, birthDate: e.target.value })} className="input" /></div>
    <div><span className="block text-sm font-medium mb-1">Svátek</span>
      <div className="flex gap-3">
        <label className="sr-only" htmlFor="person-day">Den svátku</label>
        <select id="person-day" value={value.nameDay ? day : ''} onChange={e => e.target.value ? changeDate(month, Number(e.target.value)) : onChange({ ...value, nameDay: '' })} className="input w-1/2"><option value="">Den</option>{Array.from({ length: days }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}.</option>)}</select>
        <label className="sr-only" htmlFor="person-month">Měsíc svátku</label>
        <select id="person-month" value={value.nameDay ? month : ''} onChange={e => e.target.value ? changeDate(Number(e.target.value), day) : onChange({ ...value, nameDay: '' })} className="input w-1/2"><option value="">Měsíc</option>{months.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}</select>
      </div>
      {matches.length > 0 && <p className="text-sm text-gray-600 mt-2">Podle jména můžete zvolit: {matches.map(date => <button key={date} type="button" onClick={() => onChange({ ...value, nameDay: date })} className="text-primary-600 underline mr-2">{Number(date.slice(3))}. {Number(date.slice(0, 2))}.</button>)}</p>}
    </div>
  </fieldset>
}
