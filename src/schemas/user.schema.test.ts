import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { adminUserActionSchema, nicknameSchema, updateUserProfileSchema } from './user.schema'

describe('nicknameSchema', () => {
  it('trims whitespace', () => {
    expect(v.parse(nicknameSchema, '  Ada  ')).toBe('Ada')
  })

  it('allows an empty nickname', () => {
    expect(v.parse(nicknameSchema, '   ')).toBe('')
  })

  it('rejects nicknames longer than 40 characters', () => {
    const result = v.safeParse(nicknameSchema, 'a'.repeat(41))
    expect(result.success).toBe(false)
  })
})

describe('updateUserProfileSchema', () => {
  it('accepts a nickname update', () => {
    expect(v.parse(updateUserProfileSchema, { nickname: 'Ada' })).toEqual({ nickname: 'Ada' })
  })
})

describe('adminUserActionSchema', () => {
  it('accepts admin review actions', () => {
    expect(v.parse(adminUserActionSchema, { action: 'grantAdmin' })).toEqual({ action: 'grantAdmin' })
    expect(v.parse(adminUserActionSchema, { action: 'revokeAdmin' })).toEqual({ action: 'revokeAdmin' })
    expect(v.parse(adminUserActionSchema, { action: 'revokeSubmitQuestions' })).toEqual({
      action: 'revokeSubmitQuestions',
    })
  })

  it('rejects unknown actions', () => {
    expect(v.safeParse(adminUserActionSchema, { action: 'grantSubmitQuestions' }).success).toBe(false)
  })
})
