import type { Gift } from '@/types'
import type { GiftAvailability, GiftPriority, GiftSort } from '@/hooks/useGiftFilters'

interface GiftFilterOptions {
  availability: GiftAvailability
  priority: GiftPriority
  priceEnabled: boolean
  selectedCurrency: string
  lower: number
  upper: number
  sort: GiftSort
}

const priorities: Record<string, number> = { high: 0, medium: 1, low: 2 }

export function filterAndSortGifts(gifts: Gift[], options: GiftFilterOptions): Gift[] {
  const { availability, priority, priceEnabled, selectedCurrency, lower, upper, sort } = options
  return gifts.filter(gift => {
    if (availability === 'available' && gift.is_reserved) return false
    if (availability === 'reserved' && !gift.is_reserved) return false
    if (priority !== 'all' && gift.priority !== priority) return false
    if (priceEnabled && (gift.currency !== selectedCurrency || gift.price === null || !Number.isFinite(gift.price) || gift.price < lower || gift.price > upper)) return false
    return true
  }).sort((a, b) => {
    if (sort === 'priority_desc' || sort === 'priority_asc') {
      const difference = (priorities[a.priority] ?? 3) - (priorities[b.priority] ?? 3)
      if (difference) return sort === 'priority_desc' ? difference : -difference
    } else if (sort === 'price_asc' || sort === 'price_desc') {
      // A missing price is not zero and always belongs at the end.
      if (a.price === null || b.price === null) return a.price === b.price ? 0 : a.price === null ? 1 : -1
      const difference = a.price - b.price
      if (difference) return sort === 'price_asc' ? difference : -difference
    } else {
      const difference = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (difference) return sort === 'date_asc' ? difference : -difference
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}
