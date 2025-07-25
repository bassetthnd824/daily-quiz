import dayjs from 'dayjs'

export const DATE_FORMAT = 'YYYY-MM-DD'

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

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffledArray = [...array]

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }

  return shuffledArray
}
