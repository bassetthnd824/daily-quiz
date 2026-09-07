'use client'

import { useAuth } from '@/context/user-context'
import { QuizView } from '@/models/quiz.model'
import { csrfHeaders } from '@/util/get-cookie'
import { useEffect, useState } from 'react'

type UseQuizArgs = { ensureToday: true } | { date: string }

const emptyQuiz = (date: string): QuizView => ({
  date,
  questions: [],
})

export const useQuiz = (args: UseQuizArgs) => {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState<QuizView>()
  const [error, setError] = useState('')
  const ensureToday = 'ensureToday' in args && args.ensureToday
  const date = 'date' in args ? args.date : undefined
  const ready = ensureToday ? Boolean(currentUser) : Boolean(date)

  useEffect(() => {
    if (!ready) {
      return
    }

    let cancelled = false

    const loadQuiz = async () => {
      setLoading(true)
      setError('')

      try {
        const response = ensureToday
          ? await fetch('/api/quiz', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                ...csrfHeaders(),
              },
            })
          : await fetch(`/api/quiz/${date}`)

        if (!ensureToday && response.status === 404 && date) {
          if (!cancelled) {
            setQuiz(emptyQuiz(date))
          }
          return
        }

        if (!response.ok) {
          throw new Error('Failed to load quiz')
        }

        const loaded: QuizView = await response.json()

        if (!cancelled) {
          setQuiz(loaded)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load quiz')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadQuiz()

    return () => {
      cancelled = true
    }
  }, [date, ensureToday, ready])

  return { loading, error, quiz }
}
