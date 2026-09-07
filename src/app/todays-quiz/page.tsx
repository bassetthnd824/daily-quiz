'use client'

import QuizLoader from '@/components/quiz/quiz/QuizLoader'
import { useQuiz } from '@/hooks/use-quiz'

const TodaysQuiz = () => {
  const { loading, error, quiz } = useQuiz({ ensureToday: true })
  return <QuizLoader loading={loading} error={error} quiz={quiz} />
}

export default TodaysQuiz
