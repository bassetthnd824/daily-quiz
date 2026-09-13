import * as v from 'valibot'

export const nicknameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.maxLength(40, 'Nickname must be 40 characters or fewer'),
)

export const updateUserProfileSchema = v.object({
  nickname: nicknameSchema,
})

export type UpdateUserProfileValues = v.InferInput<typeof updateUserProfileSchema>
export type UpdateUserProfilePayload = v.InferOutput<typeof updateUserProfileSchema>

export const adminUserActionSchema = v.union([
  v.object({ action: v.literal('grantAdmin') }),
  v.object({ action: v.literal('revokeAdmin') }),
  v.object({ action: v.literal('revokeSubmitQuestions') }),
])

export type AdminUserAction = v.InferOutput<typeof adminUserActionSchema>
