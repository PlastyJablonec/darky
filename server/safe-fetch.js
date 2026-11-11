import dns from 'node:dns/promises'
import http from 'node:http'
import https from 'node:https'
import ipaddr from 'ipaddr.js'

const MAX_BYTES = 1024 * 1024
const MAX_REDIRECTS = 3

export function isPublicAddress(address) {
  if (!ipaddr.isValid(address)) return false
  const parsed = ipaddr.process(address)
  return parsed.range() === 'unicast'
}

export async function resolvePublicTarget(input, lookup = dns.lookup) {
  const url = new URL(input)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || (url.port && !['80', '443'].includes(url.port))) throw new Error('invalid target')
  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (!hostname.includes('.') && !hostname.includes(':')) throw new Error('invalid hostname')
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) throw new Error('invalid hostname')
  const addresses = ipaddr.isValid(hostname) ? [{ address: hostname, family: ipaddr.parse(hostname).kind() === 'ipv4' ? 4 : 6 }] : await lookup(hostname, { all: true, verbatim: true })
  if (!addresses.length || addresses.some(item => !isPublicAddress(item.address))) throw new Error('non-public address')
  return { url, address: addresses[0] }
}

function getPage(url, address, signal) {
  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http
    const request = client.request(url, {
      method: 'GET', signal,
      headers: { 'User-Agent': 'DarekListBot/1.0 (+https://darky-seznam.vercel.app)', Accept: 'text/html,application/xhtml+xml', 'Accept-Encoding': 'identity' },
      lookup: (_host, options, callback) => options.all ? callback(null, [address]) : callback(null, address.address, address.family),
    }, response => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
        response.resume()
        resolve({ redirect: response.headers.location })
        return
      }
      if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300 || !String(response.headers['content-type'] || '').toLowerCase().includes('text/html')) {
        response.resume(); reject(new Error('unsupported response')); return
      }
      const chunks = []
      let size = 0
      response.on('data', chunk => {
        size += chunk.length
        if (size > MAX_BYTES) { response.destroy(new Error('response too large')); return }
        chunks.push(chunk)
      })
      response.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8') }))
      response.on('error', reject)
    })
    request.on('error', reject)
    request.end()
  })
}

export async function fetchPublicHtml(input, timeoutMs = 8000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    let current = input
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      const target = await Promise.race([
        resolvePublicTarget(current),
        new Promise((_, reject) => controller.signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true })),
      ])
      const response = await getPage(target.url, target.address, controller.signal)
      if (response.html !== undefined) return response.html
      if (i === MAX_REDIRECTS) throw new Error('too many redirects')
      current = new URL(response.redirect, target.url).toString()
    }
    throw new Error('too many redirects')
  } finally { clearTimeout(timeout) }
}
