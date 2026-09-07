import * as v from 'valibot'

export const requiredStringSchema = v.pipe(v.string(), v.trim(), v.minLength(1, 'This field is required'))

export const isoDateSchema = v.pipe(v.string(), v.isoDate())
