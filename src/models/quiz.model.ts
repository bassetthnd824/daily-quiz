import { Question } from '@/models/question.model'
import { QuizSummary } from './quiz-summary.model'

export type Quiz = {
  date: string
  questions: Question[]
  summaries?: Record<string, QuizSummary>
}

export type QuizQuestionView = {
  id: string
  text: string
  answers: string[]
}

export type QuizView = {
  date: string
  questions: QuizQuestionView[]
  summary?: QuizSummary
}
