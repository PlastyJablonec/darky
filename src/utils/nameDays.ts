import { getNameDay } from 'namedays-cs'

export function getDateByName(name: string): string[] {
  const results: string[] = []
  for (let month = 0; month < 12; month++) {
    const days = new Date(2000, month + 1, 0).getDate()
    for (let day = 1; day <= days; day++) {
      const date = new Date(2000, month, day)
      if (getNameDay(date).some(entry => entry.toLocaleLowerCase('cs-CZ') === name.toLocaleLowerCase('cs-CZ'))) {
        results.push(`${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
      }
    }
  }
  return results
}
