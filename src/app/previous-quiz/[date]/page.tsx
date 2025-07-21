import { quizService } from '@/bo/quiz.bo'
import Quiz from '@/components/quiz/quiz/Quiz'
import { Question } from '@/models/question.model'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const QuizForDate = () => {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const date = router.useEffect(() => {
    setQuestions(quizService.getQuizForDate(date).questions)
  }, [date])

  return <Quiz questions={questions}></Quiz>
}

export default QuizForDate
