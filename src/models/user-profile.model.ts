import { UserRecord } from 'firebase-admin/auth'

export type UserProfile = {
  displayName: string
  photoURL: string
  isAdmin: boolean
  canSubmitQuestions: boolean
  nickname?: string
}

export type QuizUser = Pick<UserRecord, 'uid' | 'email' | 'emailVerified' | 'phoneNumber'> & UserProfile
