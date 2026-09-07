import { describe, expect, it } from 'vitest'
import { formatFieldErrors } from './field-errors'

describe('formatFieldErrors', () => {
  it('joins string errors', () => {
    expect(formatFieldErrors(['Required', 'Too short'])).toBe('Required, Too short')
  })

  it('extracts message from error objects', () => {
    expect(formatFieldErrors([{ message: 'Invalid' }])).toBe('Invalid')
  })

  it('ignores values without a string message', () => {
    expect(formatFieldErrors([null, 12, { message: 1 }, { message: 'Keep' }])).toBe('Keep')
  })

  it('returns an empty string for no usable errors', () => {
    expect(formatFieldErrors([])).toBe('')
  })
})
