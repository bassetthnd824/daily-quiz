import * as v from 'valibot'

export const loginSchema = v.object({
  idToken: v.pipe(v.string(), v.minLength(1)),
})
