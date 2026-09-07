import 'server-only'
import { NEVER_USED_DATE } from '@/constants/constants'
import { questionDao } from '@/dao/question.dao'
import { firestore } from '@/firebase/server'
import { QuestionStatus } from '@/models/question-status.model'
import { QuizUser } from '@/models/user-profile.model'
import { getCurrentDate } from '@/util/utility'

export class QuestionSubmitError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'QuestionSubmitError'
    this.status = status
  }
}

const asNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const submitQuestion = async (quizUser: QuizUser, body: unknown): Promise<void> => {
  if (!quizUser.canSubmitQuestions && !quizUser.isAdmin) {
    throw new QuestionSubmitError(403, 'Not allowed to submit questions')
  }

  if (!firestore) {
    throw new QuestionSubmitError(500, 'Internal Error: no firestore')
  }

  if (!body || typeof body !== 'object') {
    throw new QuestionSubmitError(400, 'Invalid question')
  }

  const payload = body as Record<string, unknown>
  const text = asNonEmptyString(payload.text)
  const correctAnswer = asNonEmptyString(payload.correctAnswer)
  const wrongAnswers = Array.isArray(payload.answers)
    ? payload.answers.map(asNonEmptyString).filter((answer): answer is string => Boolean(answer))
    : []

  if (!text || !correctAnswer || wrongAnswers.length === 0) {
    throw new QuestionSubmitError(400, 'Invalid question')
  }

  await firestore.runTransaction(async (transaction) => {
    questionDao.addQuestion(transaction, {
      text,
      answers: [correctAnswer, ...wrongAnswers],
      lastUsedDate: NEVER_USED_DATE,
      status: QuestionStatus.PENDING,
      submittedBy: quizUser.displayName,
      dateSubmitted: getCurrentDate(),
    })
  })
}

export const questionService = {
  submitQuestion,
}
