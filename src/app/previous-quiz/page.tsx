import { quizService } from '@/bo/quiz.bo'
import { requirePageSession } from '@/util/require-session'
import { getCurrentMonthYear, getMonthDateRange, getMonthFromNdx, MonthYear, shiftMonthYear } from '@/util/utility'
import CalendarMonth from './CalendarMonth'
import classes from './page.module.scss'

type PreviousQuizProps = {
  searchParams: Promise<{ month?: string | string[] }>
}

const parseMonthYear = (monthParam?: string): MonthYear => {
  const current = getCurrentMonthYear()

  if (!monthParam) {
    return current
  }

  const match = /^(\d{4})-(\d{2})$/.exec(monthParam)

  if (!match) {
    return current
  }

  const year = Number(match[1])
  const monthNdx = Number(match[2]) - 1

  if (monthNdx < 0 || monthNdx > 11) {
    return current
  }

  if (year > current.year || (year === current.year && monthNdx > current.monthNdx)) {
    return current
  }

  return {
    year,
    monthNdx,
    month: getMonthFromNdx(monthNdx),
  }
}

const monthYearHref = (monthYear: MonthYear) =>
  `/previous-quiz?month=${monthYear.year}-${String(monthYear.monthNdx + 1).padStart(2, '0')}`

const PreviousQuiz = async ({ searchParams }: PreviousQuizProps) => {
  const uid = await requirePageSession()
  const { month } = await searchParams
  const monthParam = Array.isArray(month) ? month[0] : month
  const currentMonthYear = getCurrentMonthYear()
  const monthYear = parseMonthYear(monthParam)
  const { begDate, endDate } = getMonthDateRange(monthYear)
  const completedDates = await quizService.getCompletedQuizDates(uid, { begDate, endDate })
  const nextDisabled = monthYear.monthNdx === currentMonthYear.monthNdx && monthYear.year === currentMonthYear.year

  return (
    <div className={classes.previousQuiz}>
      <h2>See Previous Quizzes</h2>
      <CalendarMonth
        monthYear={monthYear}
        completedDates={completedDates}
        nextDisabled={nextDisabled}
        prevHref={monthYearHref(shiftMonthYear(monthYear, -1))}
        nextHref={monthYearHref(shiftMonthYear(monthYear, 1))}
      />
    </div>
  )
}

export default PreviousQuiz
