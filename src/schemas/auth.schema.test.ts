import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { loginSchema } from './auth.schema'

describe('loginSchema', () => {
  it('requires a non-empty idToken', () => {
    expect(v.parse(loginSchema, { idToken: 'abc' })).toEqual({ idToken: 'abc' })
    expect(v.safeParse(loginSchema, { idToken: '' }).success).toBe(false)
    expect(v.safeParse(loginSchema, {}).success).toBe(false)
  })
})
