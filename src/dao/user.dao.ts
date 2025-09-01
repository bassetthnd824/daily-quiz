import 'server-only'
import { firestore } from '@/firebase/server'
import { UserProfile } from '@/models/user-profile.model'

const USERS = 'users'

const getUser = async (transaction: FirebaseFirestore.Transaction, userId: string): Promise<UserProfile | undefined> => {
  if (!firestore) {
    return undefined
  }

  const docSnap = await transaction.get(firestore.doc(`${USERS}/${userId}`))
  let userProfile: UserProfile | undefined = undefined

  if (docSnap) {
    const docData = docSnap.data()
    if (docData) {
      userProfile = {
        nickname: docData.nickname,
        canSubmitQuestions: docData.canSubmitQuestions,
        isAdmin: docData.isAdmin,
        displayName: docData.displayName,
        photoURL: docData.photoURL,
      }
    }
  }

  return userProfile
}

const createUserProfile = (transaction: FirebaseFirestore.Transaction, userId: string, userProfile: UserProfile) => {
  if (!firestore) {
    return
  }

  transaction.create(firestore.doc(`${USERS}/${userId}`), { ...userProfile })
}

export const userDao = {
  getUser,
  createUserProfile,
}
