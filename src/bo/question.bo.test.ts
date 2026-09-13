import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NEVER_USED_DATE } from '@/constants/constants'
import { QuestionStatus } from '@/models/question-status.model'
import { adminUser, makeQuestion, quizUser } from '@/test/fixtures'
import { QuestionError, questionService } from './question.bo'
import { questionDao } from '@/dao/question.dao'

vi.mock('@/dao/question.dao', () => ({
  questionDao: {
    addQuestion: vi.fn(),
    listPendingQuestions: vi.fn(),
    getQuestion: vi.fn(),
    updateQuestion: vi.fn(),
  },
}))

describe('questionService.submitQuestion', () => {
  beforeEach(() => {
    vi.mocked(questionDao.addQuestion).mockReset()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 7, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects users who cannot submit questions', async () => {
    await expect(
      questionService.submitQuestion(
        { ...quizUser, canSubmitQuestions: false, isAdmin: false },
        { text: 'Q', correctAnswer: 'A', answers: ['B'] },
      ),
    ).rejects.toMatchObject({ name: 'QuestionError', status: 403 })
  })

  it('rejects invalid payloads', async () => {
    await expect(questionService.submitQuestion(quizUser, { text: '' })).rejects.toMatchObject({
      status: 400,
    })
  })

  it('stores the correct answer first and marks the question pending', async () => {
    await questionService.submitQuestion(quizUser, {
      text: 'What is 2 + 2?',
      correctAnswer: '4',
      answers: ['3', '5'],
    })

    expect(questionDao.addQuestion).toHaveBeenCalledWith({
      text: 'What is 2 + 2?',
      answers: ['4', '3', '5'],
      lastUsedDate: NEVER_USED_DATE,
      status: QuestionStatus.PENDING,
      submittedBy: 'Ada Lovelace',
      dateSubmitted: '2026-09-07',
    })
  })

  it('allows admins who cannot otherwise submit', async () => {
    await questionService.submitQuestion(
      { ...quizUser, canSubmitQuestions: false, isAdmin: true },
      { text: 'Q', correctAnswer: 'A', answers: ['B'] },
    )

    expect(questionDao.addQuestion).toHaveBeenCalledOnce()
  })
})

describe('questionService.listPendingQuestions', () => {
  it('rejects non-admins', async () => {
    vi.mocked(questionDao.listPendingQuestions).mockReset()

    await expect(questionService.listPendingQuestions(quizUser)).rejects.toMatchObject({
      name: 'QuestionError',
      status: 403,
    })
    expect(questionDao.listPendingQuestions).not.toHaveBeenCalled()
  })

  it('returns pending questions for admins', async () => {
    const pending = [makeQuestion({ id: 'q1', status: QuestionStatus.PENDING })]
    vi.mocked(questionDao.listPendingQuestions).mockResolvedValue(pending)

    await expect(questionService.listPendingQuestions(adminUser)).resolves.toEqual(pending)
  })
})

describe('questionService.reviewQuestion', () => {
  beforeEach(() => {
    vi.mocked(questionDao.getQuestion).mockReset()
    vi.mocked(questionDao.updateQuestion).mockReset()
  })

  it('rejects non-admins', async () => {
    await expect(questionService.reviewQuestion(quizUser, 'q1', { action: 'reject' })).rejects.toMatchObject({
      status: 403,
    })
  })

  it('rejects an invalid payload', async () => {
    await expect(questionService.reviewQuestion(adminUser, 'q1', { action: 'approve' })).rejects.toMatchObject({
      status: 400,
    })
  })

  it('rejects a missing question', async () => {
    vi.mocked(questionDao.getQuestion).mockResolvedValue(undefined)

    await expect(questionService.reviewQuestion(adminUser, 'q1', { action: 'reject' })).rejects.toMatchObject({
      status: 404,
    })
  })

  it('rejects a question that is no longer pending', async () => {
    vi.mocked(questionDao.getQuestion).mockResolvedValue(makeQuestion({ status: QuestionStatus.ACTIVE }))

    await expect(questionService.reviewQuestion(adminUser, 'q1', { action: 'reject' })).rejects.toMatchObject({
      status: 409,
    })
  })

  it('marks a pending question rejected', async () => {
    vi.mocked(questionDao.getQuestion).mockResolvedValue(makeQuestion({ status: QuestionStatus.PENDING }))

    await questionService.reviewQuestion(adminUser, 'q1', { action: 'reject' })

    expect(questionDao.updateQuestion).toHaveBeenCalledWith('q1', { status: QuestionStatus.REJECTED })
  })

  it('saves edits and marks a pending question active', async () => {
    vi.mocked(questionDao.getQuestion).mockResolvedValue(
      makeQuestion({ status: QuestionStatus.PENDING, text: 'Old', answers: ['A', 'B', 'C'] }),
    )

    await questionService.reviewQuestion(adminUser, 'q1', {
      action: 'approve',
      text: 'What is 2 + 2?',
      correctAnswer: '4',
      answers: ['3', '5', '22'],
    })

    expect(questionDao.updateQuestion).toHaveBeenCalledWith('q1', {
      text: 'What is 2 + 2?',
      answers: ['4', '3', '5', '22'],
      status: QuestionStatus.ACTIVE,
    })
  })
})

describe('QuestionError', () => {
  it('exposes a status code', () => {
    const error = new QuestionError(403, 'Nope')
    expect(error.status).toBe(403)
    expect(error.message).toBe('Nope')
  })
})
