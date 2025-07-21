import { firestore } from '@/firebase/server'
import { UserProfile } from '@/models/user-profile.model'

const USERS = 'users'

const getUser = async (userId: string): Promise<UserProfile | undefined> => {
  const docRef = await firestore?.doc(`${USERS}/${userId}`).get()
  let userProfile: UserProfile | undefined = undefined

  if (docRef) {
    const docData = docRef.data()
    if (docData) {
      userProfile = {
        nickname: docData.nickname,
        canSubmitQuestions: docData.canSubmitQuestions,
        isAdmin: docData.isAdmin,
      }
    }
  }

  return userProfile
}

const createUserProfile = async (userId: string, userProfile: UserProfile) => {
  await firestore?.doc(`${USERS}/${userId}`).create({ ...userProfile })
}

export const userDao = {
  getUser,
  createUserProfile,
}
