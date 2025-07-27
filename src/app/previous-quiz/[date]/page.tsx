'use client'

import Quiz from '@/components/quiz/quiz/Quiz'
import { Quiz as QuizModel } from '@/models/quiz.model'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const QuizForDate = () => {
  const params = useParams<{ date: string }>()
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState<QuizModel>()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const getQuiz = async () => {
      try {
        const data = await fetch(`/api/quiz/${params.date}`)
        const quiz = await data.json()
        setQuiz(quiz)
      } catch (error) {
        setError(error as unknown as string)
      } finally {
        setLoading(false)
      }
    }

    getQuiz()
  }, [params.date])

  return (
    <>
      {loading && <div>Loading...</div>}
      {!loading && <Quiz quiz={quiz!}></Quiz>}
      {error && <div>{error}</div>}
    </>
  )
}

export default QuizForDate
