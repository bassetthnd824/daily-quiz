import { quizService } from '@/api/service/quiz.service'
import Quiz from '@/components/pages/todays-quiz/quiz/Quiz'
import { Question } from '@/models/question.model'
import { useEffect, useState } from 'react'

const TodaysQuiz = () => {
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    setQuestions(quizService.getTodaysQuiz().questions)
  }, [])

  return <Quiz questions={questions}></Quiz>
}

export default TodaysQuiz
