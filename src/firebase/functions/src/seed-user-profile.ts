import { getFirestore } from 'firebase-admin/firestore'

export type AuthUserSeed = {
  uid: string
  displayName?: string | null
  photoURL?: string | null
}

export const seedUserProfile = async (user: AuthUserSeed): Promise<void> => {
  await getFirestore().doc(`users/${user.uid}`).create({
    isAdmin: false,
    canSubmitQuestions: true,
    nickname: '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? '',
  })
}
