import Quiz from '@/components/quiz/quiz/Quiz'
import { Question } from '@/models/question.model'
import { useEffect, useState } from 'react'

const TodaysQuiz = () => {
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const getQuiz = async () => {
      try {
        const data = await fetch('/api/quiz/todays-quiz')
        const quiz = await data.json()
        setQuestions(quiz.questions)
      } catch (error) {
        setError(error as unknown as string)
      } finally {
        setLoading(false)
      }
    }

    getQuiz()
  }, [])

  return (
    <>
      {loading && <div>Loading...</div>}
      {!loading && <Quiz questions={questions}></Quiz>}
      {error && <div>{error}</div>}
    </>
  )
}

export default TodaysQuiz
