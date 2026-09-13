import 'server-only'
import { userDao } from '@/dao/user.dao'
import { requireAuth, requireFirestore } from '@/firebase/server'
import { QuizUser, UserProfile } from '@/models/user-profile.model'
import { updateUserProfileSchema } from '@/schemas/user.schema'
import * as v from 'valibot'

export class UserProfileError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'UserProfileError'
    this.status = status
  }
}

const getUserProfile = async (userId: string): Promise<UserProfile | undefined> => {
  return userDao.getUser(userId)
}

const ensureUserProfile = async ({
  userId,
  displayName,
  photoURL,
}: {
  userId: string
  displayName: string
  photoURL: string
}): Promise<UserProfile | undefined> => {
  const db = requireFirestore()

  return db.runTransaction(async (transaction) => {
    const existing = await userDao.getUserInTransaction(transaction, userId)

    if (existing) {
      return existing
    }

    const userProfile: UserProfile = {
      nickname: '',
      displayName,
      photoURL,
      canSubmitQuestions: true,
      isAdmin: false,
    }

    userDao.createUserProfile(transaction, userId, userProfile)
    return userProfile
  })
}

const getQuizUser = async (userId: string): Promise<QuizUser | undefined> => {
  const [user, userProfile] = await Promise.all([requireAuth().getUser(userId), getUserProfile(userId)])

  if (!user || !userProfile) {
    return undefined
  }

  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    ...userProfile,
  }
}

const updateUserProfile = async (userId: string, body: unknown): Promise<QuizUser> => {
  const parsed = v.safeParse(updateUserProfileSchema, body)

  if (!parsed.success) {
    throw new UserProfileError(400, 'Invalid profile')
  }

  const existing = await userDao.getUser(userId)

  if (!existing) {
    throw new UserProfileError(404, 'Profile not found')
  }

  await userDao.updateUserProfile(userId, { nickname: parsed.output.nickname })

  const quizUser = await getQuizUser(userId)

  if (!quizUser) {
    throw new UserProfileError(500, 'Profile not found')
  }

  return quizUser
}

export const userService = {
  getUserProfile,
  ensureUserProfile,
  getQuizUser,
  updateUserProfile,
}
