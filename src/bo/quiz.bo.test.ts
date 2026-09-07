import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questionDao } from '@/dao/question.dao'
import { quizDao } from '@/dao/quiz.dao'
import { requireFirestore } from '@/firebase/server'
import { makeQuestion, makeQuiz, makeSummary, quizUser } from '@/test/fixtures'
import { QuizSubmitError, quizService } from './quiz.bo'

vi.mock('@/dao/question.dao', () => ({
  questionDao: {
    getEligibleQuestions: vi.fn(),
    setLastUsedDate: vi.fn(),
  },
}))

vi.mock('@/dao/quiz.dao', () => ({
  quizDao: {
    getQuiz: vi.fn(),
    getQuizInTransaction: vi.fn(),
    listQuizSummaries: vi.fn(),
    createQuiz: vi.fn(),
    setQuizSummary: vi.fn(),
    incrementLeaderboard: vi.fn(),
    listLeaderboard: vi.fn(),
  },
}))

vi.mock('@/firebase/server', () => ({
  requireFirestore: vi.fn(),
}))

const runTransaction = vi.fn(async (fn: (transaction: object) => unknown) => fn({}))

describe('quizService.getQuizView', () => {
  it('returns undefined when no quiz exists', async () => {
    vi.mocked(quizDao.getQuiz).mockResolvedValue(undefined)
    await expect(quizService.getQuizView('2026-09-07', quizUser.uid)).resolves.toBeUndefined()
  })

  it('omits questions when the user already has a summary', async () => {
    const summary = makeSummary()
    vi.mocked(quizDao.getQuiz).mockResolvedValue(
      makeQuiz({ summaries: { [quizUser.uid]: summary } }),
    )

    const view = await quizService.getQuizView('2026-09-07', quizUser.uid)
    expect(view?.questions).toEqual([])
    expect(view?.summary).toEqual(summary)
  })

  it('returns shuffled answers for an unfinished quiz', async () => {
    vi.mocked(quizDao.getQuiz).mockResolvedValue(makeQuiz())
    const view = await quizService.getQuizView('2026-09-07', quizUser.uid)

    expect(view?.questions).toHaveLength(2)
    expect(view?.questions[0]?.answers.sort()).toEqual(['3', '4', '5'])
    expect(view?.summary).toBeUndefined()
  })
})

describe('quizService.ensureTodaysQuiz', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(requireFirestore).mockReturnValue({ runTransaction } as never)
    runTransaction.mockImplementation(async (fn) => fn({}))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns an empty quiz on the weekend', async () => {
    vi.setSystemTime(new Date(2026, 8, 5, 12, 0, 0))
    const view = await quizService.ensureTodaysQuiz(quizUser.uid)

    expect(view.questions).toEqual([])
    expect(view.date).toBe('2026-09-05')
    expect(quizDao.getQuizInTransaction).not.toHaveBeenCalled()
  })

  it('returns an existing weekday quiz', async () => {
    vi.setSystemTime(new Date(2026, 8, 7, 12, 0, 0))
    vi.mocked(quizDao.getQuizInTransaction).mockResolvedValue(makeQuiz())

    const view = await quizService.ensureTodaysQuiz(quizUser.uid)
    expect(view.questions).toHaveLength(2)
    expect(quizDao.createQuiz).not.toHaveBeenCalled()
  })

  it('creates a quiz from eligible questions', async () => {
    vi.setSystemTime(new Date(2026, 8, 7, 12, 0, 0))
    vi.mocked(quizDao.getQuizInTransaction).mockResolvedValue(undefined)
    vi.mocked(questionDao.getEligibleQuestions).mockResolvedValue([
      makeQuestion({ id: 'q1' }),
      makeQuestion({ id: 'q2', text: 'Capital of France?', answers: ['Paris', 'Lyon'] }),
    ])

    const view = await quizService.ensureTodaysQuiz(quizUser.uid)
    expect(view.questions).toHaveLength(2)
    expect(quizDao.createQuiz).toHaveBeenCalledOnce()
  })

  it('returns an empty quiz when there are no eligible questions', async () => {
    vi.setSystemTime(new Date(2026, 8, 7, 12, 0, 0))
    vi.mocked(quizDao.getQuizInTransaction).mockResolvedValue(undefined)
    vi.mocked(questionDao.getEligibleQuestions).mockResolvedValue([])

    const view = await quizService.ensureTodaysQuiz(quizUser.uid)
    expect(view.questions).toEqual([])
    expect(quizDao.createQuiz).not.toHaveBeenCalled()
  })
})

describe('quizService.submitAnswers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 7, 12, 0, 0))
    vi.mocked(requireFirestore).mockReturnValue({ runTransaction } as never)
    runTransaction.mockImplementation(async (fn) => fn({}))
    vi.mocked(quizDao.getQuizInTransaction).mockResolvedValue(makeQuiz())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects an invalid body', async () => {
    await expect(quizService.submitAnswers('2026-09-07', quizUser, {})).rejects.toMatchObject({
      status: 400,
    })
  })

  it('rejects scoring a quiz that is not today', async () => {
    await expect(
      quizService.submitAnswers('2026-09-01', quizUser, {
        answers: [
          { questionId: 'q1', answer: '4', timeToAnswer: 1 },
          { questionId: 'q2', answer: 'Paris', timeToAnswer: 1 },
        ],
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('returns an existing summary without rescoring', async () => {
    const summary = makeSummary()
    vi.mocked(quizDao.getQuizInTransaction).mockResolvedValue(
      makeQuiz({ summaries: { [quizUser.uid]: summary } }),
    )

    await expect(
      quizService.submitAnswers('2026-09-07', quizUser, {
        answers: [
          { questionId: 'q1', answer: '4', timeToAnswer: 1 },
          { questionId: 'q2', answer: 'Paris', timeToAnswer: 1 },
        ],
      }),
    ).resolves.toEqual(summary)
    expect(quizDao.setQuizSummary).not.toHaveBeenCalled()
  })

  it('scores correct, wrong, and skipped answers', async () => {
    const summary = await quizService.submitAnswers('2026-09-07', quizUser, {
      answers: [
        { questionId: 'q1', answer: '4', timeToAnswer: 0 },
        { questionId: 'q2', answer: '', timeToAnswer: 5 },
      ],
    })

    expect(summary.answers.map((answer) => answer.status)).toEqual(['correct', 'skipped'])
    expect(summary.answers[0]?.bonus).toBe(10)
    expect(summary.score).toBe(10)
    expect(summary.skippedAnswersShare).toBe(50)
    expect(summary.correctAnswersShare).toBe(50)
    expect(summary.wrongAnswersShare).toBe(0)
    expect(summary.user.displayName).toBe('Ada')
    expect(quizDao.setQuizSummary).toHaveBeenCalledOnce()
    expect(quizDao.incrementLeaderboard).toHaveBeenCalledWith(
      expect.anything(),
      '2026-09',
      expect.objectContaining({ userId: quizUser.uid, totalScore: 10 }),
    )
  })

  it('rejects a mismatched answer count', async () => {
    await expect(
      quizService.submitAnswers('2026-09-07', quizUser, {
        answers: [{ questionId: 'q1', answer: '4', timeToAnswer: 1 }],
      }),
    ).rejects.toMatchObject({ status: 400, message: 'Answer count does not match quiz' })
  })

  it('rejects duplicate question ids', async () => {
    await expect(
      quizService.submitAnswers('2026-09-07', quizUser, {
        answers: [
          { questionId: 'q1', answer: '4', timeToAnswer: 1 },
          { questionId: 'q1', answer: '4', timeToAnswer: 1 },
        ],
      }),
    ).rejects.toMatchObject({ status: 400, message: 'Duplicate question answers' })
  })
})

describe('quizService.getCompletedQuizDates', () => {
  it('returns dates the user has a summary for', async () => {
    vi.mocked(quizDao.listQuizSummaries).mockResolvedValue([
      { date: '2026-09-01', summaries: { [quizUser.uid]: makeSummary() } },
      { date: '2026-09-02', summaries: {} },
    ])

    await expect(
      quizService.getCompletedQuizDates(quizUser.uid, { begDate: '2026-09-01', endDate: '2026-09-30' }),
    ).resolves.toEqual(['2026-09-01'])
  })
})

describe('QuizSubmitError', () => {
  it('exposes a status code', () => {
    const error = new QuizSubmitError(404, 'Quiz not found')
    expect(error.status).toBe(404)
  })
})
