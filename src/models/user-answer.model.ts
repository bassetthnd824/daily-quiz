export type SubmittedAnswer = {
  questionId: string
  answer: string
  timeToAnswer: number
}

export type UserAnswer = {
  questionId?: string
  questionText?: string
  answer: string
  timeToAnswer: number
  status?: 'correct' | 'skipped' | 'wrong'
  bonus?: number
}
