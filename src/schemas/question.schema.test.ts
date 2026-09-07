import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { submitQuestionDefaultValues, submitQuestionSchema } from './question.schema'

describe('submitQuestionSchema', () => {
  it('accepts a complete question', () => {
    const parsed = v.parse(submitQuestionSchema, {
      text: 'What is 2 + 2?',
      correctAnswer: '4',
      answers: ['3', '5', '22'],
    })

    expect(parsed.answers).toHaveLength(3)
  })

  it('rejects empty answers', () => {
    const result = v.safeParse(submitQuestionSchema, {
      text: 'Q',
      correctAnswer: 'A',
      answers: [],
    })

    expect(result.success).toBe(false)
  })

  it('starts with three blank distractors', () => {
    expect(submitQuestionDefaultValues.answers).toEqual(['', '', ''])
  })
})
