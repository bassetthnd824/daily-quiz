import classes from './page.module.scss'
import { getCalendarDays, MonthYear, toIsoDate } from '@/util/utility'
import Link from 'next/link'

type CalendarMonthProps = {
  monthYear: MonthYear
  completedDates: string[]
  nextDisabled: boolean
  prevHref: string
  nextHref: string
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const CalendarMonth = ({ monthYear, completedDates, nextDisabled, prevHref, nextHref }: CalendarMonthProps) => {
  const days = getCalendarDays(monthYear)

  return (
    <div className={classes.calendar}>
      <div className={classes.calendarHeader}>
        <div className={classes.monthYearRow}>
          <Link href={prevHref} className={`btn ${classes.monthNav}`}>
            &lt;&lt;
          </Link>
          <h3>
            {monthYear.month} {monthYear.year}
          </h3>
          {nextDisabled ? (
            <button type="button" className="btn" disabled>
              &gt;&gt;
            </button>
          ) : (
            <Link href={nextHref} className={`btn ${classes.monthNav}`}>
              &gt;&gt;
            </Link>
          )}
        </div>
        <div className={classes.calendarRow}>
          {WEEKDAYS.map((label, index) => (
            <div key={`${label}-${index}`} className={classes.calendarDay}>
              {label}
            </div>
          ))}
        </div>
        <div className={classes.calendarRow}>
          {days.map((day, index) => {
            const date = day ? toIsoDate(monthYear, day) : ''
            const hasQuiz = Boolean(date && completedDates.includes(date))

            return (
              <div key={`${monthYear.year}-${monthYear.monthNdx}-${index}`} className={`${classes.calendarDay} ${hasQuiz ? classes.hasQuiz : ''}`}>
                {hasQuiz ? (
                  <Link className={classes.previousQuizLink} href={`/previous-quiz/${date}`}>
                    {day}
                  </Link>
                ) : (
                  day
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CalendarMonth
