import { Cake, Flower2, CalendarDays, Gift } from 'lucide-react'
import { upcomingDate } from '@/utils/anniversary'

export interface OccasionDates {
  birth_date: string | null
  name_day: string | null
  person_name?: string | null
}

export function SharedOccasions({ dates }: { dates: OccasionDates | null }) {
  const occasions = [
    dates?.birth_date ? { label: 'Narozeniny', value: dates.birth_date, Icon: Cake, color: 'bg-rose-100 text-rose-600' } : null,
    dates?.name_day ? { label: 'Svátek', value: dates.name_day, Icon: Flower2, color: 'bg-violet-100 text-violet-600' } : null,
    { label: 'Ježíšek', value: '2000-12-24', Icon: Gift, color: 'bg-emerald-100 text-emerald-600' },
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))
  return <section aria-label="Důležitá data" className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-violet-50 p-4 sm:p-5 text-left shadow-sm">
    <div className="flex items-center gap-2 mb-3 text-gray-700"><CalendarDays aria-hidden="true" className="h-4 w-4 text-rose-500" />
      <h2 className="font-semibold text-sm">{dates?.person_name ? `Důležité dny · ${dates.person_name}` : 'Důležité dny'}</h2></div>
    <div className={`grid grid-cols-1 gap-3 ${occasions.length > 1 ? 'sm:grid-cols-2' : ''}`}>
      {occasions.map(({ label, value, Icon, color }) => {
        const next = upcomingDate(value)
        return <div key={label} className={`min-w-0 flex items-center gap-3 rounded-xl bg-white/90 border border-white p-3 sm:p-4 ${label === 'Ježíšek' && occasions.length === 3 ? 'sm:col-span-2' : ''}`}>
          <span className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${color}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>
          <div className="min-w-0"><p className="text-xs font-medium text-gray-500 whitespace-nowrap">{label} · {next.date}</p><p className="text-lg sm:text-xl font-bold text-gray-900">{next.countdown}</p></div>
        </div>
      })}
    </div>
    <p className="mt-3 text-xs text-gray-500">Ježíšek už leští saně. 🎄</p>
  </section>
}
