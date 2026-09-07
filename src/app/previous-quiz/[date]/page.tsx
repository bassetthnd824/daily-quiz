'use client'

import QuizLoader from '@/components/quiz/quiz/QuizLoader'
import { useQuiz } from '@/hooks/use-quiz'
import { useParams } from 'next/navigation'

const QuizForDate = () => {
  const params = useParams<{ date: string }>()
  const { loading, error, quiz } = useQuiz({ date: params.date })
  return <QuizLoader loading={loading} error={error} quiz={quiz} />
}

export default QuizForDate
