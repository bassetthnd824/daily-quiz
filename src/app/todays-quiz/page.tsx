'use client'

import Quiz from '@/components/quiz/quiz/Quiz'
import { QuizView } from '@/models/quiz.model'
import { getCurrentDate } from '@/util/utility'
import { useEffect, useState } from 'react'

const TodaysQuiz = () => {
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState<QuizView>()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const getQuiz = async () => {
      try {
        const data = await fetch(`/api/quiz/${getCurrentDate()}`)

        if (!data.ok) {
          throw new Error('Failed to load quiz')
        }

        const quiz = await data.json()
        setQuiz(quiz)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    getQuiz()
  }, [])

  return (
    <>
      {loading && <div>Loading...</div>}
      {!loading && error && <div>{error}</div>}
      {!loading && !error && quiz && <Quiz quiz={quiz}></Quiz>}
    </>
  )
}

export default TodaysQuiz
