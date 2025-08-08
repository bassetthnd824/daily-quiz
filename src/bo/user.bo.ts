import { userDao } from '@/dao/user.dao'
import { auth, firestore } from '@/firebase/server'
import { QuizUser, UserProfile } from '@/models/user-profile.model'
import { UserRecord } from 'firebase-admin/auth'

const getUserProfile = async (userId: string): Promise<UserProfile | undefined> => {
  let userProfile: UserProfile | undefined
  try {
    await firestore?.runTransaction(async (transaction) => {
      userProfile = await userDao.getUser(transaction, userId)
    })
  } catch (error) {
    console.error('Transation Failed', error)
  }

  return userProfile
}

const createUserProfile = async ({
  userId,
  displayName,
  photoURL,
}: {
  userId: string
  displayName: string
  photoURL: string
}): Promise<UserProfile | undefined> => {
  let userProfile: UserProfile | undefined = undefined
  try {
    await firestore?.runTransaction(async (transaction) => {
      userProfile = {
        nickname: '',
        displayName,
        photoURL,
        canSubmitQuestions: true,
        isAdmin: false,
      }
      userDao.createUserProfile(transaction, userId, userProfile)
    })
  } catch (error) {
    console.error('Transaction Failed', error)
  }
  return userProfile
}

const getQuizUser = async (userId: string): Promise<QuizUser | undefined> => {
  const user: UserRecord | undefined = await auth?.getUser(userId)
  const userProfile = await userService.getUserProfile(userId)

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
  createUserProfile,
  getQuizUser,
}
