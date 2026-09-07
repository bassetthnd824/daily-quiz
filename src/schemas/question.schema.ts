import * as v from 'valibot'
import { requiredStringSchema } from './common.schema'

export const submitQuestionSchema = v.object({
  text: requiredStringSchema,
  correctAnswer: requiredStringSchema,
  answers: v.pipe(v.array(requiredStringSchema), v.minLength(1, 'This field is required')),
})

export type SubmitQuestionValues = v.InferInput<typeof submitQuestionSchema>
export type SubmitQuestionPayload = v.InferOutput<typeof submitQuestionSchema>

export const submitQuestionDefaultValues: SubmitQuestionValues = {
  text: '',
  correctAnswer: '',
  answers: ['', '', ''],
}
