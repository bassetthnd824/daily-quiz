import * as v from 'valibot'
import { isoDateSchema } from './common.schema'

export const submittedAnswerSchema = v.object({
  questionId: v.pipe(v.string(), v.minLength(1)),
  answer: v.string(),
  timeToAnswer: v.pipe(v.number(), v.finite()),
})

export const submittedAnswersSchema = v.array(submittedAnswerSchema)

export const submitQuizBodySchema = v.object({
  answers: submittedAnswersSchema,
})

export const dateRangeSchema = v.object({
  begDate: isoDateSchema,
  endDate: isoDateSchema,
})
