import 'server-only'
import { userDao } from '@/dao/user.dao'
import { requireAuth, requireFirestore } from '@/firebase/server'
import { QuizUser, UserProfile } from '@/models/user-profile.model'

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

export const userService = {
  getUserProfile,
  ensureUserProfile,
  getQuizUser,
}
