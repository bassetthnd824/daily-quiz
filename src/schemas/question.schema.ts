import { Question } from '@/models/question.model'
import * as v from 'valibot'
import { requiredStringSchema } from './common.schema'

const wrongAnswersSchema = v.pipe(v.array(requiredStringSchema), v.minLength(1, 'This field is required'))

export const submitQuestionSchema = v.object({
  text: requiredStringSchema,
  correctAnswer: requiredStringSchema,
  answers: wrongAnswersSchema,
})

export type SubmitQuestionValues = v.InferInput<typeof submitQuestionSchema>
export type SubmitQuestionPayload = v.InferOutput<typeof submitQuestionSchema>

export const submitQuestionDefaultValues: SubmitQuestionValues = {
  text: '',
  correctAnswer: '',
  answers: ['', '', ''],
}

export const approveQuestionSchema = v.object({
  action: v.literal('approve'),
  text: requiredStringSchema,
  correctAnswer: requiredStringSchema,
  answers: wrongAnswersSchema,
})

export const rejectQuestionSchema = v.object({
  action: v.literal('reject'),
})

export const reviewQuestionSchema = v.union([approveQuestionSchema, rejectQuestionSchema])

export type ReviewQuestionPayload = v.InferOutput<typeof reviewQuestionSchema>

export const questionToFormValues = (question: Question): SubmitQuestionValues => ({
  text: question.text,
  correctAnswer: question.answers[0] ?? '',
  answers: question.answers.length > 1 ? question.answers.slice(1) : [''],
})
