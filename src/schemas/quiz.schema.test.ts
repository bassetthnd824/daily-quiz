import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { dateRangeSchema, submitQuizBodySchema } from './quiz.schema'

describe('submitQuizBodySchema', () => {
  it('accepts valid submitted answers', () => {
    const parsed = v.parse(submitQuizBodySchema, {
      answers: [{ questionId: 'q1', answer: '4', timeToAnswer: 3.2 }],
    })

    expect(parsed.answers).toHaveLength(1)
  })

  it('rejects a missing questionId', () => {
    expect(
      v.safeParse(submitQuizBodySchema, {
        answers: [{ questionId: '', answer: '4', timeToAnswer: 1 }],
      }).success,
    ).toBe(false)
  })

  it('rejects a non-finite timeToAnswer', () => {
    expect(
      v.safeParse(submitQuizBodySchema, {
        answers: [{ questionId: 'q1', answer: '4', timeToAnswer: Number.POSITIVE_INFINITY }],
      }).success,
    ).toBe(false)
  })
})

describe('dateRangeSchema', () => {
  it('requires ISO begin and end dates', () => {
    expect(v.parse(dateRangeSchema, { begDate: '2026-09-01', endDate: '2026-09-30' })).toEqual({
      begDate: '2026-09-01',
      endDate: '2026-09-30',
    })
    expect(v.safeParse(dateRangeSchema, { begDate: 'sept', endDate: '2026-09-30' }).success).toBe(false)
  })
})
