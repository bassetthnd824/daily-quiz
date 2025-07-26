export type UserAnswer = {
  questionText?: string
  answer: string
  timeToAnswer: number
  status?: 'correct' | 'skipped' | 'wrong'
  bonus?: number
}
