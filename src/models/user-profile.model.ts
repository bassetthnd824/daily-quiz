import { UserRecord } from 'firebase-admin/auth'

export type UserProfile = {
  isAdmin: boolean
  canSubmitQuestions: boolean
  nickname?: string
}

export type QuizUser = Pick<UserRecord, 'uid' | 'email' | 'emailVerified' | 'displayName' | 'photoURL' | 'phoneNumber'> & UserProfile
