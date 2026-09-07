import { quizService } from '@/bo/quiz.bo'
import Quiz from '@/components/quiz/quiz/Quiz'
import { requirePageSession } from '@/util/require-session'

export const dynamic = 'force-dynamic'

const TodaysQuiz = async () => {
  const uid = await requirePageSession()
  const quiz = await quizService.ensureTodaysQuiz(uid)
  return <Quiz quiz={quiz} countdown />
}

export default TodaysQuiz
