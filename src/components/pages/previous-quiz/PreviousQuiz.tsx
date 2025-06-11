import { useState } from 'react'
import Link from 'next/link'
import classes from './PreviousQuiz.module.scss'
import dayjs from 'dayjs'

type MonthYearState = {
  monthNdx: number
  month: string
  year: number
}

const getCurrentMonthYear = (): MonthYearState => {
  const monthNdx = dayjs().month()
  const month = getMonthFromNdx(monthNdx)
  const year = `${dayjs().year()}`

  return {
    monthNdx,
    month,
    year,
  }
}

const getMonthFromNdx = (ndx: number) => {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][ndx]
}

const PreviousQuiz = () => {
  const currentMonthYear = getCurrentMonthYear()
  const [monthYear, setMonthYear] = useState<MonthYearState>(currentMonthYear)
  const incrementDisabled = monthYear.monthNdx === currentMonthYear.monthNdx && monthYear.year === currentMonthYear.year
  const baseDate = dayjs(new Date(monthYear.year, monthYear.monthNdx, 1))
  const dayOfWeek = baseDate.day()
  const daysInMonth = baseDate.daysInMonth()
  const calendarArray: string[] = []
  const ndxLimit = ((daysInMonth === 30 && dayOfWeek > 5) || (daysInMonth === 31 && dayOfWeek > 4)) ? 42 : 35
  let j = 1

  for (let i = 0; i < ndxLimit; i++) {
    if (i >= dayOfWeek && j <= daysInMonth) {
      calendarArray.push(`${j}`)
      j++
    } else {
      calendarArray.push('')
    }
  }

  const handleDecrmentMonthYear = () => {
    setMonthYear(prevMonthYear => {
      let monthNdx = prevMonthYear.monthNdx - 1
      let year = prevMonthYear.year

      if (monthNdx < 0) {
        monthNdx = 11
        year--
      }

      return {
        monthNdx,
        month: getMonthFromNdx(monthNdx),
        year,
      }
    })
  }

  const handleIncrementMonthYear = () => {
    setMonthYear(prevMonthYear => {
      let monthNdx = prevMonthYear.monthNdx + 1
      let year = prevMonthYear.year

      if (monthNdx > 11) {
        monthNdx = 0
        year++
      }

      return {
        monthNdx,
        month: getMonthFromNdx(monthNdx),
        year,
      }
    })
  }

  return (
    <div className={classes.previousQuiz}>
      <h2>Take a Previous Day&#39;s Quiz</h2>
      <div className={classes.calendar}>
        <div className={classes.calendarHeader}>
          <div className={classes.monthYearRow}>
            <button type="button" onClick={handleDecrmentMonthYear}>&lt;&lt;</button>
            <h3>{monthYear.month} {monthYear.year}</h3>
            <button type="button" onClick={handleIncrementMonthYear} disabled={incrementDisabled}>&gt;&gt;</button>
          </div>
          <div className={classes.calendarRow}>
            <div className={classes.calendarDay}>S</div>
            <div className={classes.calendarDay}>M</div>
            <div className={classes.calendarDay}>T</div>
            <div className={classes.calendarDay}>W</div>
            <div className={classes.calendarDay}>T</div>
            <div className={classes.calendarDay}>F</div>
            <div className={classes.calendarDay}>S</div>
          </div>
          <div className={classes.calendarRow}>
            {calendarArray.map((day) => {
              let content = ''

              if (day) {
                const date = `${monthYear.year}-${String(monthYear.monthNdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                content = <Link className={classes.previousQuizLink} href={`/previous-quiz/${date}`}>{day}</Link>
              }

              return (
                <div key={Math.random()} className={classes.calendarDay}>
                  {content}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviousQuiz
