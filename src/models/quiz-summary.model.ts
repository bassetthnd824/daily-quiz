import { UserAnswer } from './user-answer.model'

export type QuizSummary = {
  skippedAnswersShare: number
  correctAnswersShare: number
  wrongAnswersShare: number
  score: number
  answers: UserAnswer[]
  user: {
    displayName: string
    photoURL: string
  }
}
