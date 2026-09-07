import { requirePageSession } from '@/util/require-session'
import SubmitQuestionForm from './SubmitQuestionForm'

const SubmitQuestion = async () => {
  await requirePageSession()
  return <SubmitQuestionForm />
}

export default SubmitQuestion
