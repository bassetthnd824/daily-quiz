import { quizService } from '@/bo/quiz.bo'
import Quiz from '@/components/quiz/quiz/Quiz'
import { QuizView } from '@/models/quiz.model'
import { requirePageSession } from '@/util/require-session'

type QuizForDateProps = {
  params: Promise<{ date: string }>
}

const emptyQuiz = (date: string): QuizView => ({
  date,
  questions: [],
})

const QuizForDate = async ({ params }: QuizForDateProps) => {
  const uid = await requirePageSession()
  const { date } = await params
  const quiz = (await quizService.getQuizView(date, uid)) ?? emptyQuiz(date)
  return <Quiz quiz={quiz} />
}

export default QuizForDate
