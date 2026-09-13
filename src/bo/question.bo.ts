import 'server-only'
import { NEVER_USED_DATE } from '@/constants/constants'
import { questionDao } from '@/dao/question.dao'
import { Question } from '@/models/question.model'
import { QuestionStatus } from '@/models/question-status.model'
import { QuizUser } from '@/models/user-profile.model'
import { reviewQuestionSchema, submitQuestionSchema } from '@/schemas/question.schema'
import { getCurrentDate } from '@/util/utility'
import * as v from 'valibot'

export class QuestionError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'QuestionError'
    this.status = status
  }
}

const submitQuestion = async (quizUser: QuizUser, body: unknown): Promise<void> => {
  if (!quizUser.canSubmitQuestions && !quizUser.isAdmin) {
    throw new QuestionError(403, 'Not allowed to submit questions')
  }

  const parsed = v.safeParse(submitQuestionSchema, body)

  if (!parsed.success) {
    throw new QuestionError(400, 'Invalid question')
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

const assertAdmin = (quizUser: QuizUser) => {
  if (!quizUser.isAdmin) {
    throw new QuestionError(403, 'Not allowed to review questions')
  }
}

const listPendingQuestions = async (quizUser: QuizUser): Promise<Question[]> => {
  assertAdmin(quizUser)
  return questionDao.listPendingQuestions()
}

const reviewQuestion = async (quizUser: QuizUser, questionId: string, body: unknown): Promise<void> => {
  assertAdmin(quizUser)

  if (!questionId) {
    throw new QuestionError(400, 'Invalid question')
  }

  const parsed = v.safeParse(reviewQuestionSchema, body)

  if (!parsed.success) {
    throw new QuestionError(400, 'Invalid question')
  }

  const existing = await questionDao.getQuestion(questionId)

  if (!existing) {
    throw new QuestionError(404, 'Question not found')
  }

  if (existing.status !== QuestionStatus.PENDING) {
    throw new QuestionError(409, 'Question is no longer pending')
  }

  if (parsed.output.action === 'reject') {
    await questionDao.updateQuestion(questionId, { status: QuestionStatus.REJECTED })
    return
  }

  const { text, correctAnswer, answers } = parsed.output

  await questionDao.updateQuestion(questionId, {
    text,
    answers: [correctAnswer, ...answers],
    status: QuestionStatus.ACTIVE,
  })
}

export const questionService = {
  submitQuestion,
  listPendingQuestions,
  reviewQuestion,
}
