'use client'

import Quiz from '@/components/quiz/quiz/Quiz'
import { CSRF_TOKEN_NAME } from '@/constants/constants'
import { useAuth } from '@/context/user-context'
import { QuizView } from '@/models/quiz.model'
import { getCookie } from '@/util/csrf-tokens'
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
        const csrfTokenCookie = getCookie(CSRF_TOKEN_NAME)
        const data = await fetch('/api/quiz', {
          method: 'POST',
          headers: {
            [CSRF_TOKEN_NAME]: csrfTokenCookie ?? '',
            Accept: 'application/json',
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
