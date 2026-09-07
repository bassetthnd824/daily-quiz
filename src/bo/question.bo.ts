import 'server-only'
import { NEVER_USED_DATE } from '@/constants/constants'
import { questionDao } from '@/dao/question.dao'
import { QuestionStatus } from '@/models/question-status.model'
import { QuizUser } from '@/models/user-profile.model'
import { submitQuestionSchema } from '@/schemas/question.schema'
import { getCurrentDate } from '@/util/utility'
import * as v from 'valibot'

export class QuestionSubmitError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'QuestionSubmitError'
    this.status = status
  }
}

const submitQuestion = async (quizUser: QuizUser, body: unknown): Promise<void> => {
  if (!quizUser.canSubmitQuestions && !quizUser.isAdmin) {
    throw new QuestionSubmitError(403, 'Not allowed to submit questions')
  }

  const parsed = v.safeParse(submitQuestionSchema, body)

  if (!parsed.success) {
    throw new QuestionSubmitError(400, 'Invalid question')
  }

  const { text, correctAnswer, answers } = parsed.output

  await questionDao.addQuestion({
    text,
    answers: [correctAnswer, ...answers],
    lastUsedDate: NEVER_USED_DATE,
    status: QuestionStatus.PENDING,
    submittedBy: quizUser.displayName,
    dateSubmitted: getCurrentDate(),
  })
}

export const questionService = {
  submitQuestion,
}
