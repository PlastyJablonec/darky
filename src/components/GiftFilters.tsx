import type { useGiftFilters, GiftAvailability, GiftPriority, GiftSort } from '@/hooks/useGiftFilters'

type Filters = ReturnType<typeof useGiftFilters>

export function GiftFilters({ filters, showAvailability }: { filters: Filters; showAvailability: boolean }) {
  const f = filters
  return <section aria-label="Filtrování a řazení dárků" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
    <div className="flex flex-wrap gap-4 items-end">
      {showAvailability && <label className="text-sm text-gray-700 flex flex-col gap-1">Dostupnost
        <select value={f.availability} onChange={e => f.setAvailability(e.target.value as GiftAvailability)} className="input text-sm"><option value="all">Všechny dárky</option><option value="available">K dispozici</option><option value="reserved">Rezervované</option></select>
      </label>}
      <label className="text-sm text-gray-700 flex flex-col gap-1">Priorita
        <select value={f.priority} onChange={e => f.setPriority(e.target.value as GiftPriority)} className="input text-sm"><option value="all">Všechny priority</option><option value="high">Vysoká</option><option value="medium">Střední</option><option value="low">Nízká</option></select>
      </label>
      <label className="text-sm text-gray-700 flex flex-col gap-1">Řazení
        <select value={f.sort} onChange={e => f.setSort(e.target.value as GiftSort)} className="input text-sm"><option value="priority_desc">Nejžádanější</option><option value="priority_asc">Nejméně žádané</option><option value="date_desc">Nejnovější</option><option value="date_asc">Nejstarší</option><option value="price_asc">Od nejlevnějšího</option><option value="price_desc">Od nejdražšího</option></select>
      </label>
      <button type="button" onClick={f.reset} className="text-sm text-primary-600 underline py-2">Zrušit filtry</button>
      <p className="text-sm text-gray-500 sm:ml-auto py-2">Zobrazeno {f.filtered.length} z {f.active.length}</p>
    </div>
    {f.bounds && <div className="border-t pt-3 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={f.priceEnabled} onChange={e => f.setPriceEnabled(e.target.checked)} />Filtrovat podle ceny</label>
        {f.currencies.length > 1 && <label className="text-sm">Měna: <select value={f.selectedCurrency} onChange={e => f.changeCurrency(e.target.value)} className="border rounded p-1">{f.currencies.map(c => <option key={c} value={c}>{c}</option>)}</select></label>}
        {f.priceEnabled && <span className="text-xs text-gray-500">Dárky bez ceny se při filtrování nezobrazují.</span>}
      </div>
      {f.currencies.length > 1 && <p className="text-xs text-gray-500">Částky v různých měnách se při řazení nepřepočítávají.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-gray-700">Od {f.lower.toLocaleString('cs-CZ')} {f.selectedCurrency}
          <input aria-label="Nejnižší cena" type="range" min={f.bounds.min} max={f.bounds.max} step="0.01" value={f.lower} disabled={!f.priceEnabled} onChange={e => f.setMinPrice(Math.min(Number(e.target.value), f.upper))} className="w-full block accent-primary-600" /></label>
        <label className="text-sm text-gray-700">Do {f.upper.toLocaleString('cs-CZ')} {f.selectedCurrency}
          <input aria-label="Nejvyšší cena" type="range" min={f.bounds.min} max={f.bounds.max} step="0.01" value={f.upper} disabled={!f.priceEnabled} onChange={e => f.setMaxPrice(Math.max(Number(e.target.value), f.lower))} className="w-full block accent-primary-600" /></label>
      </div>
    </div>}
  </section>
}
