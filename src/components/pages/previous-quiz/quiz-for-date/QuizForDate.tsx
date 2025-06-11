import { quizService } from '@/api/service/quiz.service'
import Quiz from '@/components/quiz/quiz/Quiz'
import { Question } from '@/models/question.model'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const QuizForDate = () => {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const date = router.query.date

  useEffect(() => {
    setQuestions(quizService.getQuizForDate(date).questions)
  }, [date])

  return <Quiz questions={questions}></Quiz>
}

export default QuizForDate
