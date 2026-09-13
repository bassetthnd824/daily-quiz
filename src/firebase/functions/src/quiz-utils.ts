export const isoDateToday = (now = new Date()): string => {
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().split('T')[0]
}

export const isWeekday = (date: string): boolean => {
  const day = new Date(`${date}T00:00:00`).getDay()
  return day !== 0 && day !== 6
}

export const daysBefore = (date: string, days: number): string => {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day - days)).toISOString().slice(0, 10)
}

export const shuffle = <T>(items: T[]): T[] => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
