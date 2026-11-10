import { upcomingDate } from '@/utils/anniversary'
import type { ManagedPerson } from '@/types'

export function ManagedPersonSummary({ person }: { person: ManagedPerson | null | undefined }) {
  if (!person) return null
  return <div className="space-y-1 text-sm text-gray-600">
    {person.person_name && <p>Pro: {person.person_name}</p>}
    {person.birth_date && (() => { const next = upcomingDate(person.birth_date); return <p>🎂 Narozeniny {next.date} – {next.countdown}</p> })()}
    {person.name_day && (() => { const next = upcomingDate(person.name_day); return <p>🌷 Svátek {next.date} – {next.countdown}</p> })()}
  </div>
}
