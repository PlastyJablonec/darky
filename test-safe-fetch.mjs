import assert from 'node:assert/strict'
import { isPublicAddress, resolvePublicTarget } from './server/safe-fetch.js'
import handler from './api/link-preview.js'
for (const ip of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '192.168.0.1', '172.16.0.1', '100.64.1.1', '::1', 'fc00::1', 'fe80::1', '::ffff:127.0.0.1']) assert.equal(isPublicAddress(ip), false, ip)
assert.equal(isPublicAddress('8.8.8.8'), true)
assert.equal(isPublicAddress('2606:4700:4700::1111'), true)
await assert.rejects(() => resolvePublicTarget('http://127.0.0.1/'))
await assert.rejects(() => resolvePublicTarget('https://shop.example/', async () => [{ address: '127.0.0.1', family: 4 }]))
await assert.rejects(() => resolvePublicTarget('https://shop.example/', async () => [{ address: '8.8.8.8', family: 4 }, { address: '192.168.1.1', family: 4 }]))
await assert.rejects(() => resolvePublicTarget('http://shop.example:8080/'))
await assert.rejects(() => resolvePublicTarget('https://user:password@shop.example/'))
assert.equal((await resolvePublicTarget('https://shop.example/', async () => [{ address: '8.8.8.8', family: 4 }])).address.address, '8.8.8.8')
const response = { code: 0, body: null, status(code) { this.code = code; return this }, json(body) { this.body = body; return this } }
await handler({ method: 'GET', query: { url: 'http://127.0.0.1/' } }, response)
assert.equal(response.code, 422)
console.log('SSRF address validation: checks passed')

