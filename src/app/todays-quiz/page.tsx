'use client'

import Quiz from '@/components/quiz/quiz/Quiz'
import { useAuth } from '@/context/user-context'
import { QuizView } from '@/models/quiz.model'
import { csrfHeaders } from '@/util/get-cookie'
import { useEffect, useState } from 'react'

const TodaysQuiz = () => {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState<QuizView>()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!currentUser) {
      return
    }

    const ensureQuiz = async () => {
      try {
        const data = await fetch('/api/quiz', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            ...csrfHeaders(),
          },
        })

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

    ensureQuiz()
  }, [currentUser])

  return (
    <>
      {loading && <div>Loading...</div>}
      {!loading && error && <div>{error}</div>}
      {!loading && !error && quiz && <Quiz quiz={quiz}></Quiz>}
    </>
  )
}

export default TodaysQuiz
