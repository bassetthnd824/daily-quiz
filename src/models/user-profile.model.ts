import { User } from 'firebase/auth'

export type UserProfile = {
  isAdmin: boolean
  canSubmitQuestions: boolean
  nickname?: string
}

export type QuizUser = User & UserProfile
