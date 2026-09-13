import { questionService } from '@/bo/question.bo'
import { userService } from '@/bo/user.bo'
import { requirePageSession } from '@/util/require-session'
import { redirect } from 'next/navigation'
import PendingQuestionsReview from './PendingQuestionsReview'

const PendingQuestionsPage = async () => {
  const uid = await requirePageSession()
  const user = await userService.getQuizUser(uid)

  if (!user?.isAdmin) {
    redirect('/')
  }

  const questions = await questionService.listPendingQuestions(user)

  return <PendingQuestionsReview questions={questions} />
}

export default PendingQuestionsPage
