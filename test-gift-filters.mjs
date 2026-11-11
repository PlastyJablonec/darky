import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'
import assert from 'node:assert/strict'
const source = await readFile('src/utils/giftFilters.ts', 'utf8')
const result = await transform(source, { loader: 'ts', format: 'esm' })
const { filterAndSortGifts, budgetLimit } = await import(`data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}`)
const gifts = [
  { id: 'low', priority: 'low', price: 0, currency: 'CZK', created_at: '2026-01-01', is_reserved: false },
  { id: 'high', priority: 'high', price: 100, currency: 'CZK', created_at: '2026-01-02', is_reserved: true },
  { id: 'medium', priority: 'medium', price: null, currency: 'CZK', created_at: '2026-01-03', is_reserved: false },
  { id: 'euro', priority: 'high', price: 50, currency: 'EUR', created_at: '2026-01-04', is_reserved: false },
]
const base = { availability: 'all', priority: 'all', priceEnabled: false, selectedCurrency: 'CZK', lower: 0, upper: 100, sort: 'priority_desc' }
const ids = options => filterAndSortGifts(gifts, { ...base, ...options }).map(g => g.id)
assert.deepEqual(ids({}), ['euro', 'high', 'medium', 'low'])
assert.deepEqual(ids({ priority: 'high', availability: 'available' }), ['euro'])
assert.deepEqual(ids({ priceEnabled: true }), ['high', 'low'])
assert.deepEqual(ids({ priceEnabled: true, lower: 1 }), ['high'])
assert.deepEqual(ids({ sort: 'price_asc' }), ['low', 'euro', 'high', 'medium'])
assert.deepEqual(ids({ sort: 'price_desc' }), ['high', 'euro', 'low', 'medium'])
assert.equal(budgetLimit(500), 600)
const budgetGifts = [525, 600, 601].map(price => ({ id: String(price), priority: 'high', price, currency: 'CZK', created_at: '2026-01-01', is_reserved: false }))
assert.deepEqual(filterAndSortGifts(budgetGifts, { ...base, priceEnabled: true, upper: budgetLimit(500) }).map(g => g.id), ['525', '600'])
assert.deepEqual(filterAndSortGifts(budgetGifts, { ...base, priceEnabled: true, upper: budgetLimit(100) }).map(g => g.id), [])
console.log('Gift filters and budget tolerance: 9 checks passed')
