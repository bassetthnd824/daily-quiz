'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import classes from './page.module.scss'
import dayjs from 'dayjs'
import { getCurrentMonthYear, getMonthFromNdx, MonthYear } from '@/util/utility'
import { Quiz } from '@/models/quiz.model'
import { useAuth } from '@/context/user-context'

const PreviousQuiz = () => {
  const currentMonthYear = getCurrentMonthYear()
  const [monthYear, setMonthYear] = useState<MonthYear>(currentMonthYear)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const { currentUser } = useAuth()
  const userId = currentUser?.uid
  const baseDate = dayjs(new Date(monthYear.year, monthYear.monthNdx, 1))
  const dayOfWeek = baseDate.day()
  const daysInMonth = baseDate.daysInMonth()

  useEffect(() => {
    const getQuizzes = async () => {
      const month = (currentMonthYear.monthNdx + 1).toString().padStart(2, '0')
      const begDate = `${currentMonthYear.year}-${month}-01`
      const endDate = `${currentMonthYear.year}-${month}-${daysInMonth}`

      try {
        const quizzesResponse = await fetch(`/api/quiz?begDate=${begDate}&endDate=${endDate}`)
        setQuizzes(await quizzesResponse.json())
      } catch (error) {
        console.log(error)
      }
    }

    getQuizzes()
  }, [currentMonthYear.monthNdx, currentMonthYear.year, daysInMonth])

  const incrementDisabled = monthYear.monthNdx === currentMonthYear.monthNdx && monthYear.year === currentMonthYear.year
  const calendarArray: string[] = []
  const ndxLimit = (daysInMonth === 30 && dayOfWeek > 5) || (daysInMonth === 31 && dayOfWeek > 4) ? 42 : 35
  let j = 1

  for (let i = 0; i < ndxLimit; i++) {
    if (i >= dayOfWeek && j <= daysInMonth) {
      calendarArray.push(`${j}`)
      j++
    } else {
      calendarArray.push('')
    }
  }

  const userQuizzes = quizzes.filter((quiz) => Boolean(quiz.summaries?.[userId!]))

  const handleDecrmentMonthYear = () => {
    setMonthYear((prevMonthYear) => {
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
    setMonthYear((prevMonthYear) => {
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
      <h2>See Previous Quizzes</h2>
      <div className={classes.calendar}>
        <div className={classes.calendarHeader}>
          <div className={classes.monthYearRow}>
            <button type="button" className="btn" onClick={handleDecrmentMonthYear}>
              &lt;&lt;
            </button>
            <h3>
              {monthYear.month} {monthYear.year}
            </h3>
            <button type="button" className="btn" onClick={handleIncrementMonthYear} disabled={incrementDisabled}>
              &gt;&gt;
            </button>
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
              let content
              let quiz

              if (day) {
                const date = `${monthYear.year}-${String(monthYear.monthNdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                quiz = userQuizzes.find((quiz) => quiz.date === date)
                if (quiz) {
                  content = (
                    <Link className={classes.previousQuizLink} href={`/previous-quiz/${date}`}>
                      {day}
                    </Link>
                  )
                } else {
                  content = day
                }
              }

              return (
                <div key={Math.random()} className={`${classes.calendarDay} ${quiz ? classes.hasQuiz : ''}`}>
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
