import { useMemo, useState } from 'react'
import type { Gift } from '@/types'
import { filterAndSortGifts } from '@/utils/giftFilters'

export type GiftSort = 'priority_desc' | 'priority_asc' | 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc'
export type GiftAvailability = 'all' | 'available' | 'reserved'
export type GiftPriority = 'all' | 'high' | 'medium' | 'low'

export function useGiftFilters(gifts: Gift[]) {
  const [sort, setSort] = useState<GiftSort>('priority_desc')
  const [availability, setAvailability] = useState<GiftAvailability>('all')
  const [priority, setPriority] = useState<GiftPriority>('all')
  const [priceEnabled, setPriceEnabled] = useState(false)
  const [currency, setCurrency] = useState('')
  const [minPrice, setMinPrice] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)

  const active = useMemo(() => gifts.filter(g => !g.is_received), [gifts])
  const currencies = useMemo(() => [...new Set(active.filter(g => g.price !== null).map(g => g.currency))].sort(), [active])
  const selectedCurrency = currencies.includes(currency) ? currency : currencies[0] || ''
  const bounds = useMemo(() => {
    const prices = active.filter(g => g.currency === selectedCurrency && g.price !== null && Number.isFinite(g.price)).map(g => g.price as number)
    return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null
  }, [active, selectedCurrency])
  const lower = bounds ? Math.min(bounds.max, Math.max(bounds.min, minPrice ?? bounds.min)) : 0
  const upper = bounds ? Math.max(lower, Math.min(bounds.max, maxPrice ?? bounds.max)) : 0
  const filtered = useMemo(() => filterAndSortGifts(active, { availability, priority, priceEnabled, selectedCurrency, lower, upper, sort }), [active, availability, priority, priceEnabled, selectedCurrency, lower, upper, sort])

  const changeCurrency = (value: string) => { setCurrency(value); setMinPrice(null); setMaxPrice(null) }
  const reset = () => { setAvailability('all'); setPriority('all'); setPriceEnabled(false); setMinPrice(null); setMaxPrice(null); setSort('priority_desc') }
  return { active, filtered, sort, setSort, availability, setAvailability, priority, setPriority, priceEnabled, setPriceEnabled, currencies, selectedCurrency, changeCurrency, bounds, lower, upper, setMinPrice, setMaxPrice, reset }
}
