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
