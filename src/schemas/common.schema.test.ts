import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { isoDateSchema, requiredStringSchema } from './common.schema'

describe('requiredStringSchema', () => {
  it('accepts a non-empty string', () => {
    expect(v.parse(requiredStringSchema, '  hello  ')).toBe('hello')
  })

  it('rejects blank strings', () => {
    const result = v.safeParse(requiredStringSchema, '   ')
    expect(result.success).toBe(false)
  })
})

describe('isoDateSchema', () => {
  it('accepts an ISO date', () => {
    expect(v.parse(isoDateSchema, '2026-09-07')).toBe('2026-09-07')
  })

  it('rejects a non-ISO date', () => {
    expect(v.safeParse(isoDateSchema, '09/07/2026').success).toBe(false)
  })
})
