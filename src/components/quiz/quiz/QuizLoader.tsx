'use client'

import Quiz from '@/components/quiz/quiz/Quiz'
import { QuizView } from '@/models/quiz.model'

type QuizLoaderProps = {
  loading: boolean
  error: string
  quiz?: QuizView
}

const QuizLoader = ({ loading, error, quiz }: QuizLoaderProps) => {
  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!quiz) {
    return null
  }

  return <Quiz quiz={quiz} />
}

export default QuizLoader
