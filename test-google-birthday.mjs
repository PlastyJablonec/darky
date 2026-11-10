import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'
import assert from 'node:assert/strict'
const source = await readFile('src/utils/googleBirthday.ts', 'utf8')
const result = await transform(source, { loader: 'ts', format: 'esm' })
const { selectGoogleBirthday } = await import(`data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}`)
const now = new Date('2026-11-10T12:00:00Z')
assert.equal(selectGoogleBirthday([{ metadata: { primary: true }, date: { month: 1, day: 1 } }, { metadata: { source: { type: 'ACCOUNT' } }, date: { year: 1990, month: 1, day: 1 } }], now), '1990-01-01')
assert.equal(selectGoogleBirthday([{ date: { month: 1, day: 1 } }], now), null)
assert.equal(selectGoogleBirthday([{ date: { year: 1990, month: 2, day: 30 } }], now), null)
assert.equal(selectGoogleBirthday([{ date: { year: 2030, month: 1, day: 1 } }], now), null)
assert.equal(selectGoogleBirthday([{ date: { year: 1990, month: 1, day: 1 } }, { date: { year: 1991, month: 1, day: 1 } }], now), null)
console.log('Google birthday selection: 5 checks passed')
