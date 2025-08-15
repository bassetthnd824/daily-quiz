import { QuestionStatus } from './question-status.model'

export type Question = {
  id: string
  text: string
  answers: string[]
  lastUsedDate: string
  status: QuestionStatus
  submittedBy: string
  dateSubmitted: string
}
