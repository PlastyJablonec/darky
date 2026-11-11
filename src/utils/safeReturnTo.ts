export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(value)) return '/wishlists'
  try {
    const origin = window.location.origin
    const target = new URL(value, origin)
    if (target.origin !== origin) return '/wishlists'
    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return '/wishlists'
  }
}
