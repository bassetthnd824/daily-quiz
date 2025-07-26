import { Question } from '@/models/question.model'
import { QuizSummary } from './quiz-summary.model'

export const QUESTION_TIME = 10000
export const SELECTED_TIME = 1000
export const CORRECT_TIME = 2000

export type Quiz = {
  date: string
  questions: Question[]
  summaries?: Record<string, QuizSummary>
}
