'use client'

import { useEffect, useState } from 'react'
import classes from './page.module.scss'
import { getCurrentMonthYear, getMonthDateRange, MonthYear, shiftMonthYear } from '@/util/utility'
import CalendarMonth from './CalendarMonth'

const PreviousQuiz = () => {
  const currentMonthYear = getCurrentMonthYear()
  const [monthYear, setMonthYear] = useState<MonthYear>(currentMonthYear)
  const [completedDates, setCompletedDates] = useState<string[]>([])

  useEffect(() => {
    const getCompletedDates = async () => {
      const { begDate, endDate } = getMonthDateRange(monthYear)

      try {
        const quizzesResponse = await fetch(`/api/quiz?begDate=${begDate}&endDate=${endDate}`)
        const dates: unknown = await quizzesResponse.json()
        setCompletedDates(Array.isArray(dates) ? dates : [])
      } catch (error) {
        console.log(error)
      }
    }

    getCompletedDates()
  }, [monthYear])

  const nextDisabled = monthYear.monthNdx === currentMonthYear.monthNdx && monthYear.year === currentMonthYear.year

  return (
    <div className={classes.previousQuiz}>
      <h2>See Previous Quizzes</h2>
      <CalendarMonth
        monthYear={monthYear}
        completedDates={completedDates}
        nextDisabled={nextDisabled}
        onPrev={() => setMonthYear((current) => shiftMonthYear(current, -1))}
        onNext={() => setMonthYear((current) => shiftMonthYear(current, 1))}
      />
    </div>
  )
}

export default PreviousQuiz
