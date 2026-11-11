import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { build } from 'esbuild'
const require = createRequire(import.meta.url)
const { outputFiles } = await build({ entryPoints: ['src/components/ReservationOverview.tsx', 'src/components/SharedOccasions.tsx'], bundle: true, platform: 'node', format: 'cjs', packages: 'external', write: false, outdir: 'test-output', tsconfig: 'tsconfig.json' })
const load = file => { const mod = { exports: {} }; new Function('require', 'module', 'exports', file.text)(require, mod, mod.exports); return mod.exports }
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { ReservationOverview } = load(outputFiles.find(file => file.path.endsWith('ReservationOverview.js')))
const { SharedOccasions } = load(outputFiles.find(file => file.path.endsWith('SharedOccasions.js')))
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props))
const gifts = [{ is_received: false, is_reserved: true }, { is_received: false, is_reserved: false }, { is_received: true, is_reserved: true }]
const html = render(ReservationOverview, { gifts, personal: true })
assert.match(html, /1 z 2 rezervováno/)
assert.match(html, /1 zbývá/)
assert.match(html, /Majitel seznamu nevidí/)
assert.doesNotMatch(render(ReservationOverview, { gifts: [], personal: false }), /z 0 rezervováno/)
assert.match(render(ReservationOverview, { gifts: gifts.slice(0, 1), personal: false }), /Všechna přání/)
assert.match(render(SharedOccasions, { dates: null }), /Ježíšek/)
const dates = render(SharedOccasions, { dates: { birth_date: '1982-11-24', name_day: '2000-06-25' } })
assert.match(dates, /Narozeniny/)
assert.match(dates, /Svátek/)
assert.match(dates, /Ježíšek/)
assert.doesNotMatch(dates, /1982/)
console.log('Shared list overview: 10 checks passed')
