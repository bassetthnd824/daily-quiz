import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { makeQuestion } from '@/test/fixtures'
import {
  questionToFormValues,
  reviewQuestionSchema,
  submitQuestionDefaultValues,
  submitQuestionSchema,
} from './question.schema'

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

describe('reviewQuestionSchema', () => {
  it('accepts an approval with edits', () => {
    expect(
      v.parse(reviewQuestionSchema, {
        action: 'approve',
        text: 'What is 2 + 2?',
        correctAnswer: '4',
        answers: ['3', '5'],
      }),
    ).toMatchObject({ action: 'approve', correctAnswer: '4' })
  })

  it('accepts a rejection', () => {
    expect(v.parse(reviewQuestionSchema, { action: 'reject' })).toEqual({ action: 'reject' })
  })

  it('rejects an approval without answers', () => {
    expect(
      v.safeParse(reviewQuestionSchema, {
        action: 'approve',
        text: 'Q',
        correctAnswer: 'A',
        answers: [],
      }).success,
    ).toBe(false)
  })
})

describe('questionToFormValues', () => {
  it('splits the correct answer from the distractors', () => {
    expect(questionToFormValues(makeQuestion({ answers: ['4', '3', '5', '22'] }))).toEqual({
      text: 'What is 2 + 2?',
      correctAnswer: '4',
      answers: ['3', '5', '22'],
    })
  })
})
