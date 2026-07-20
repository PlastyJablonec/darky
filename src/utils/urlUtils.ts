const HTTP_URL_PATTERN = /^https?:\/\//i

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function normalizeHttpUrl(rawValue: string): string {
  const trimmedValue = rawValue.trim()
  if (!trimmedValue) {
    throw new Error('URL je povinna')
  }

  const candidate = HTTP_URL_PATTERN.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`

  if (!isHttpUrl(candidate)) {
    throw new Error('URL musi zacinat na http:// nebo https://')
  }

  return candidate
}

export function extractUrlFromText(value: string): string | null {
  const match = value.match(/https?:\/\/[^\s]+/i)
  return match ? match[0] : null
}

export function trimToNull(value: string): string | null {
  const trimmedValue = value.trim()
  return trimmedValue ? trimmedValue : null
}
