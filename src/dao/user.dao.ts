import 'server-only'
import { requireFirestore } from '@/firebase/server'
import { UserProfile } from '@/models/user-profile.model'
import { Transaction } from 'firebase-admin/firestore'

const USERS = 'users'

const userRef = (userId: string) => requireFirestore().doc(`${USERS}/${userId}`)

const toUserProfile = (docData: FirebaseFirestore.DocumentData | undefined): UserProfile | undefined => {
  if (!docData) {
    return undefined
  }

  return {
    nickname: docData.nickname,
    canSubmitQuestions: docData.canSubmitQuestions,
    isAdmin: docData.isAdmin,
    displayName: docData.displayName,
    photoURL: docData.photoURL,
  }
}

const getUser = async (userId: string): Promise<UserProfile | undefined> => {
  const snapshot = await userRef(userId).get()

  if (!snapshot.exists) {
    return undefined
  }

  return toUserProfile(snapshot.data())
}

const getUserInTransaction = async (transaction: Transaction, userId: string): Promise<UserProfile | undefined> => {
  const snapshot = await transaction.get(userRef(userId))

  if (!snapshot.exists) {
    return undefined
  }

  return toUserProfile(snapshot.data())
}

const createUserProfile = (transaction: Transaction, userId: string, userProfile: UserProfile) => {
  transaction.create(userRef(userId), { ...userProfile })
}

export const userDao = {
  getUser,
  getUserInTransaction,
  createUserProfile,
}
