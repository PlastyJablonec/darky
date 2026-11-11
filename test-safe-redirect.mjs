import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'
globalThis.window = { location: { origin: 'https://darky-seznam.vercel.app' } }
const source = await readFile('src/utils/safeReturnTo.ts', 'utf8')
const result = await transform(source, { loader: 'ts', format: 'esm' })
const { safeReturnTo } = await import(`data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}`)
for (const value of ['https://attacker.example', '//attacker.example', '/\\attacker.example', 'javascript:alert(1)', '/\n/attacker.example', null]) assert.equal(safeReturnTo(value), '/wishlists')
assert.equal(safeReturnTo('/shared/abc123?test=1'), '/shared/abc123?test=1')
assert.equal(safeReturnTo('/settings?googleBirthday=1'), '/settings?googleBirthday=1')
console.log('Authentication redirect checks passed')
