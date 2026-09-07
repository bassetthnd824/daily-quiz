import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NEVER_USED_DATE } from '@/constants/constants'
import { QuestionStatus } from '@/models/question-status.model'
import { quizUser } from '@/test/fixtures'
import { QuestionSubmitError, questionService } from './question.bo'
import { questionDao } from '@/dao/question.dao'

vi.mock('@/dao/question.dao', () => ({
  questionDao: {
    addQuestion: vi.fn(),
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
    ).rejects.toMatchObject({ name: 'QuestionSubmitError', status: 403 })
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

describe('QuestionSubmitError', () => {
  it('exposes a status code', () => {
    const error = new QuestionSubmitError(403, 'Nope')
    expect(error.status).toBe(403)
    expect(error.message).toBe('Nope')
  })
})
