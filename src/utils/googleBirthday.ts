export interface GoogleBirthday {
  date?: { year?: number; month?: number; day?: number }
  metadata?: { primary?: boolean; source?: { type?: string } }
}

export function selectGoogleBirthday(entries: GoogleBirthday[], today = new Date()): string | null {
  const completeDates = entries.flatMap(entry => {
    const value = entry.date
    if (!value?.year || !value.month || !value.day) return []
    const { year, month, day } = value
    const date = new Date(Date.UTC(year, month - 1, day))
    if (year < 1900 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || date.getTime() > today.getTime()) return []
    return [{ entry, formatted: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` }]
  })
  const account = completeDates.find(item => item.entry.metadata?.source?.type === 'ACCOUNT')
  const primary = completeDates.find(item => item.entry.metadata?.primary)
  if (account) return account.formatted
  if (primary) return primary.formatted
  const unique = [...new Set(completeDates.map(item => item.formatted))]
  return unique.length === 1 ? unique[0] : null
}
