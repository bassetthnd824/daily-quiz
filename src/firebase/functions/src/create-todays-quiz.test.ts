import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_DAILY_QUESTIONS } from './create-todays-quiz.js'

const { getFirestore, logger } = vi.hoisted(() => ({
  getFirestore: vi.fn(),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore,
}))

vi.mock('firebase-functions', () => ({
  logger,
}))

const monday = new Date(2026, 8, 14, 8, 0, 0)
const sunday = new Date(2026, 8, 13, 8, 0, 0)

const makeQuestionDoc = (id: string) => ({
  id,
  data: () => ({
    text: `Question ${id}`,
    answers: ['A', 'B'],
    lastUsedDate: '1111-11-11',
    status: 'A',
    submittedBy: 'Ada',
    dateSubmitted: '2026-01-01',
  }),
})

const mockFirestore = ({ quizExists = false, docs = [] as ReturnType<typeof makeQuestionDoc>[] } = {}) => {
  const create = vi.fn()
  const set = vi.fn()
  const get = vi.fn(async (target: { path?: string }) => {
    if (target?.path?.startsWith('quizzes/')) {
      return { exists: quizExists }
    }

    return { docs }
  })
  const where = vi.fn()
  where.mockReturnValue({ where })
  const collection = vi.fn(() => ({ where }))
  const doc = vi.fn((path: string) => ({ path }))
  const runTransaction = vi.fn(async (fn: (transaction: { get: typeof get; create: typeof create; set: typeof set }) => unknown) =>
    fn({ get, create, set }),
  )

  getFirestore.mockReturnValue({ doc, collection, runTransaction })

  return { create, set, get, where, collection, doc, runTransaction }
}

describe('createTodaysQuiz', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('skips quiz creation on the weekend', async () => {
    const { create } = mockFirestore()
    const { createTodaysQuiz } = await import('./create-todays-quiz.js')

    await createTodaysQuiz(sunday)

    expect(getFirestore).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith('Skipping quiz creation on the weekend', { date: '2026-09-13' })
  })

  it('does nothing when today already has a quiz', async () => {
    const { create, set } = mockFirestore({ quizExists: true })
    const { createTodaysQuiz } = await import('./create-todays-quiz.js')

    await createTodaysQuiz(monday)

    expect(create).not.toHaveBeenCalled()
    expect(set).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith('Quiz already exists', { date: '2026-09-14' })
  })

  it('does not create a quiz when no questions are eligible', async () => {
    const { create } = mockFirestore({ docs: [] })
    const { createTodaysQuiz } = await import('./create-todays-quiz.js')

    await createTodaysQuiz(monday)

    expect(create).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith("No eligible questions for today's quiz", { date: '2026-09-14' })
  })

  it('creates a quiz from eligible questions and marks them used', async () => {
    const docs = [makeQuestionDoc('q1'), makeQuestionDoc('q2')]
    const { create, set, where, collection } = mockFirestore({ docs })
    const { createTodaysQuiz } = await import('./create-todays-quiz.js')

    await createTodaysQuiz(monday)

    expect(collection).toHaveBeenCalledWith('questions')
    expect(where).toHaveBeenCalledWith('status', '==', 'A')
    expect(where).toHaveBeenCalledWith('lastUsedDate', '<', '2026-08-15')
    expect(create).toHaveBeenCalledWith(
      { path: 'quizzes/2026-09-14' },
      expect.objectContaining({
        date: '2026-09-14',
        questions: expect.arrayContaining([
          expect.objectContaining({ id: 'q1', text: 'Question q1' }),
          expect.objectContaining({ id: 'q2', text: 'Question q2' }),
        ]),
      }),
    )
    expect(create.mock.calls[0]?.[1].questions).toHaveLength(2)
    expect(set).toHaveBeenCalledWith({ path: 'questions/q1' }, { lastUsedDate: '2026-09-14' }, { merge: true })
    expect(set).toHaveBeenCalledWith({ path: 'questions/q2' }, { lastUsedDate: '2026-09-14' }, { merge: true })
  })

  it('limits the quiz to the maximum number of questions', async () => {
    const docs = Array.from({ length: MAX_DAILY_QUESTIONS + 3 }, (_, index) => makeQuestionDoc(`q${index}`))
    const { create } = mockFirestore({ docs })
    const { createTodaysQuiz } = await import('./create-todays-quiz.js')

    await createTodaysQuiz(monday)

    expect(create.mock.calls[0]?.[1].questions).toHaveLength(MAX_DAILY_QUESTIONS)
  })
})
