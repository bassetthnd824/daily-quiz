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

const updateUserProfile = async (userId: string, updates: Pick<UserProfile, 'nickname'>) => {
  await userRef(userId).update({ ...updates })
}

const listUsers = async (): Promise<Array<{ uid: string } & UserProfile>> => {
  const snapshot = await requireFirestore().collection(USERS).get()

  return snapshot.docs.flatMap((doc) => {
    const profile = toUserProfile(doc.data())
    return profile ? [{ uid: doc.id, ...profile }] : []
  })
}

const updateUserRoles = async (
  userId: string,
  updates: Partial<Pick<UserProfile, 'isAdmin' | 'canSubmitQuestions'>>,
) => {
  await userRef(userId).update({ ...updates })
}

const deleteUser = async (userId: string) => {
  await userRef(userId).delete()
}

export const userDao = {
  getUser,
  getUserInTransaction,
  createUserProfile,
  updateUserProfile,
  listUsers,
  updateUserRoles,
  deleteUser,
}
