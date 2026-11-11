import { fetchPublicHtml } from '../server/safe-fetch.js'

const REQUEST_TIMEOUT_MS = 8000

function sendError(response, statusCode, message) {
  response.status(statusCode).json({ error: message })
}

function sanitizeText(value) {
  if (!value) {
    return ''
  }

  return String(value).replace(/\s+/g, ' ').trim().slice(0, 500)
}

function sanitizeImageUrl(value) {
  if (!value) {
    return ''
  }

  try {
    const parsedUrl = new URL(value)
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return parsedUrl.toString()
    }
  } catch {
    return ''
  }

  return ''
}

function getMetaContent(html, key, attribute) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(
    `<meta[^>]+${attribute}=["']${escapedKey}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i',
  )
  const reversePattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${escapedKey}["'][^>]*>`,
    'i',
  )

  return sanitizeText(html.match(pattern)?.[1] || html.match(reversePattern)?.[1] || '')
}

function getTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return sanitizeText(match?.[1] || '')
}

function getJsonLdPrice(html) {
  const matches = Array.from(html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))

  for (const match of matches) {
    const rawBlock = match[1]?.trim()
    if (!rawBlock) {
      continue
    }

    try {
      const parsed = JSON.parse(rawBlock)
      const candidates = Array.isArray(parsed) ? parsed : [parsed]

      for (const candidate of candidates) {
        const offers = Array.isArray(candidate?.offers) ? candidate.offers[0] : candidate?.offers
        const rawPrice = offers?.price ?? candidate?.price
        const rawCurrency = offers?.priceCurrency ?? candidate?.priceCurrency

        if (rawPrice) {
          const numericPrice = Number(String(rawPrice).replace(',', '.'))
          if (!Number.isNaN(numericPrice)) {
            return {
              price: numericPrice,
              currency: sanitizeText(rawCurrency || ''),
            }
          }
        }
      }
    } catch {
      continue
    }
  }

  return { price: null, currency: null }
}

function getPreviewPayload(url, html) {
  const ogTitle = getMetaContent(html, 'og:title', 'property')
  const ogDescription = getMetaContent(html, 'og:description', 'property')
  const ogImage = sanitizeImageUrl(getMetaContent(html, 'og:image', 'property'))
  const ogSiteName = getMetaContent(html, 'og:site_name', 'property')
  const metaDescription = getMetaContent(html, 'description', 'name')
  const productPrice = getMetaContent(html, 'product:price:amount', 'property')
  const productCurrency = getMetaContent(html, 'product:price:currency', 'property')
  const jsonLdPrice = getJsonLdPrice(html)
  const parsedUrl = new URL(url)

  const numericPrice = productPrice ? Number(productPrice.replace(',', '.')) : null

  return {
    title: ogTitle || getTitle(html) || parsedUrl.hostname,
    description: ogDescription || metaDescription,
    imageUrl: ogImage,
    productUrl: url,
    siteName: ogSiteName || parsedUrl.hostname,
    price: numericPrice && !Number.isNaN(numericPrice) ? numericPrice : jsonLdPrice.price,
    currency: productCurrency || jsonLdPrice.currency,
  }
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return sendError(response, 405, 'Method not allowed')
  }

  const rawUrl = Array.isArray(request.query.url) ? request.query.url[0] : request.query.url
  if (!rawUrl || typeof rawUrl !== 'string') {
    return sendError(response, 400, 'Parametr url je povinny')
  }

  let normalizedUrl
  try {
    normalizedUrl = new URL(rawUrl)
  } catch {
    return sendError(response, 400, 'Neplatna URL')
  }

  if (!['http:', 'https:'].includes(normalizedUrl.protocol)) {
    return sendError(response, 400, 'Podporovany je pouze http/https odkaz')
  }

  try {
    const html = await fetchPublicHtml(normalizedUrl.toString(), REQUEST_TIMEOUT_MS)
    const data = getPreviewPayload(normalizedUrl.toString(), html)
    return response.status(200).json({ data })
  } catch (error) {
    console.error('Link preview failed:', error instanceof Error ? error.message : 'unknown error')
    return sendError(response, 422, 'Metadata odkazu se nepodařilo načíst. Zkontrolujte veřejnou adresu.')
  }
}

