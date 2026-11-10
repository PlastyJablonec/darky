export function upcomingDate(value: string, today = new Date()): { date: string; countdown: string } {
  const [, month, day] = value.split('-').map(Number)
  const year = today.getFullYear()
  const occurrence = (y: number) => {
    // A leap-day anniversary falls on February 28 in non-leap years.
    const lastDay = new Date(y, month, 0).getDate()
    return new Date(y, month - 1, Math.min(day, lastDay))
  }
  const start = Date.UTC(year, today.getMonth(), today.getDate())
  let next = occurrence(year)
  if (Date.UTC(next.getFullYear(), next.getMonth(), next.getDate()) < start) next = occurrence(year + 1)
  const days = Math.round((Date.UTC(next.getFullYear(), next.getMonth(), next.getDate()) - start) / 86400000)
  return {
    date: `${day}. ${month}.`,
    countdown: days === 0 ? 'dnes' : days === 1 ? 'zítra' : `za ${days} ${days < 5 ? 'dny' : 'dní'}`,
  }
}
