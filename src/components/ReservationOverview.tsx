import { Gift, Sparkles } from 'lucide-react'
import type { Gift as GiftType } from '@/types'

export function ReservationOverview({ gifts, personal }: { gifts: GiftType[]; personal: boolean }) {
  const active = gifts.filter(gift => !gift.is_received)
  const reserved = active.filter(gift => gift.is_reserved).length
  const remaining = active.length - reserved
  const percentage = active.length ? Math.round(reserved / active.length * 100) : 0
  return <section aria-label="Přehled rezervací" className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 sm:p-5 text-left shadow-sm">
    <div className="flex items-start gap-3">
      <span className="shrink-0 rounded-xl bg-indigo-100 p-2.5 text-indigo-600"><Gift aria-hidden="true" className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-indigo-950">{personal ? 'Pssst! Nebojte se rezervovat' : 'Dárky čekají na své Ježíšky'}</h2>
        <p className="text-sm text-indigo-800 mt-1">{personal ? 'Majitel seznamu nevidí, které dárky jste rezervovali. Překvapení je v bezpečí!' : 'Správce seznamu vidí rezervace a může dárky společně s vámi koordinovat.'}</p>
        {active.length > 0 && <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm font-medium text-indigo-950">
            <span>{reserved} z {active.length} rezervováno</span><span>{remaining} zbývá</span>
          </div>
          <div role="progressbar" aria-label="Rezervované dárky" aria-valuemin={0} aria-valuemax={active.length} aria-valuenow={reserved} className="h-2 rounded-full bg-indigo-200 mt-2 overflow-hidden"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${percentage}%` }} /></div>
          <p className="flex items-center gap-1.5 mt-3 text-xs text-indigo-700"><Sparkles aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />{remaining === 0 ? 'Všechna přání už mají svého Ježíška!' : reserved === 0 ? 'Zatím je celý seznam volný. Kdo začne?' : 'Pár přání ještě čeká na svého Ježíška.'}</p>
        </div>}
      </div>
    </div>
  </section>
}
