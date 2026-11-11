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
        <h3 className="text-sm font-medium text-gray-800">Cena</h3>
        {f.currencies.length > 1 && <label className="text-sm">Měna: <select value={f.selectedCurrency} onChange={e => f.changeCurrency(e.target.value)} className="border rounded p-1">{f.currencies.map(c => <option key={c} value={c}>{c}</option>)}</select></label>}
        {f.priceEnabled && <button type="button" onClick={f.clearPrice} className="text-sm text-primary-600 underline">Zobrazit všechny ceny</button>}
      </div>
      {f.selectedCurrency === 'CZK' && <div className="flex flex-wrap gap-2" aria-label="Rychlý výběr rozpočtu">
        {[500, 1000, 2000, 5000].map(amount => <button key={amount} type="button" onClick={() => f.setBudget(amount)} aria-pressed={f.selectedBudget === amount} className={`rounded-full border px-3 py-1 text-sm ${f.selectedBudget === amount ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'}`}>Do {amount.toLocaleString('cs-CZ')} Kč</button>)}
      </div>}
      {f.selectedBudget !== null && <p className="text-sm text-gray-600">Včetně tolerance 100 Kč: zobrazujeme dárky do {(f.selectedBudget + 100).toLocaleString('cs-CZ')} Kč.</p>}
      {f.priceEnabled && <p className="text-xs text-gray-500">Dárky bez uvedené ceny se při filtrování nezobrazují.</p>}
      {f.currencies.length > 1 && <p className="text-xs text-gray-500">Částky v různých měnách se při řazení nepřepočítávají.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-gray-700">Od {f.lower.toLocaleString('cs-CZ')} {f.selectedCurrency}
          <input aria-label="Nejnižší cena" type="range" min={0} max={f.sliderMax} step="0.01" value={f.lower} onChange={e => f.changeMinPrice(Number(e.target.value))} className="w-full block accent-primary-600" /></label>
        <label className="text-sm text-gray-700">Do {f.upper.toLocaleString('cs-CZ')} {f.selectedCurrency}
          <input aria-label="Nejvyšší cena" type="range" min={0} max={f.sliderMax} step="0.01" value={f.upper} onChange={e => f.changeMaxPrice(Number(e.target.value))} className="w-full block accent-primary-600" /></label>
      </div>
      {!f.priceEnabled && <p className="text-xs text-gray-500">Posunutím nastavíte cenové rozpětí.</p>}
    </div>}
  </section>
}
