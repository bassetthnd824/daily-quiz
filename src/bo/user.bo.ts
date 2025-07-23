import { userDao } from '@/dao/user.dao'
import { firestore } from '@/firebase/server'
import { UserProfile } from '@/models/user-profile.model'

const getUserProfile = async (userId: string): Promise<UserProfile | undefined> => {
  let userProfile: UserProfile | undefined
  try {
    await firestore?.runTransaction(async (transaction) => {
      userProfile = await userDao.getUser(transaction, userId)

      if (!userProfile) {
        userProfile = {
          nickname: '',
          canSubmitQuestions: true,
          isAdmin: false,
        }
        userDao.createUserProfile(transaction, userId, userProfile)
      }
    })
  } catch (error) {
    console.error('Transation Failed', error)
  }

  return userProfile
}

export const userService = {
  getUserProfile,
}
