import dayjs from 'dayjs'

export type MonthYear = {
  monthNdx: number
  month: string
  year: number
}

export const getCurrentDate = () => {
  let yourDate = new Date()
  const offset = yourDate.getTimezoneOffset()
  yourDate = new Date(yourDate.getTime() - offset * 60 * 1000)
  return yourDate.toISOString().split('T')[0]
}

export const yearMonthFromDate = (date: string) => date.slice(0, 7)

export const isWeekday = (date: string) => {
  const day = dayjs(date).day()
  return day !== 0 && day !== 6
}

export const getCurrentMonthYear = (): MonthYear => {
  const monthNdx = dayjs().month()
  const month = getMonthFromNdx(monthNdx)
  const year = dayjs().year()

  return {
    monthNdx,
    month,
    year,
  }
}

export const getMonthFromNdx = (ndx: number) => {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][ndx]
}

export const getMonthDateRange = (monthYear: MonthYear = getCurrentMonthYear()) => {
  const baseDate = dayjs(new Date(monthYear.year, monthYear.monthNdx, 1))
  const daysInMonth = baseDate.daysInMonth()
  const month = (monthYear.monthNdx + 1).toString().padStart(2, '0')
  return {
    begDate: `${monthYear.year}-${month}-01`,
    endDate: `${monthYear.year}-${month}-${daysInMonth}`,
  }
}

export const shiftMonthYear = (monthYear: MonthYear, delta: number): MonthYear => {
  const shifted = dayjs(new Date(monthYear.year, monthYear.monthNdx, 1)).add(delta, 'month')
  const monthNdx = shifted.month()

  return {
    monthNdx,
    month: getMonthFromNdx(monthNdx),
    year: shifted.year(),
  }
}

export const getCalendarDays = (monthYear: MonthYear): (number | null)[] => {
  const baseDate = dayjs(new Date(monthYear.year, monthYear.monthNdx, 1))
  const dayOfWeek = baseDate.day()
  const daysInMonth = baseDate.daysInMonth()
  const cellCount = (daysInMonth === 30 && dayOfWeek > 5) || (daysInMonth === 31 && dayOfWeek > 4) ? 42 : 35
  const cells: (number | null)[] = []
  let day = 1

  for (let i = 0; i < cellCount; i++) {
    if (i >= dayOfWeek && day <= daysInMonth) {
      cells.push(day)
      day += 1
    } else {
      cells.push(null)
    }
  }

  return cells
}

export const toIsoDate = (monthYear: MonthYear, day: number) =>
  `${monthYear.year}-${String(monthYear.monthNdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffledArray = [...array]

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }

  return shuffledArray
}
