import admin from 'firebase-admin'
import { cert, getApps, ServiceAccount } from 'firebase-admin/app'
import { Firestore, getFirestore } from 'firebase-admin/firestore'
import { Auth, getAuth } from 'firebase-admin/auth'

const currentApps = getApps()
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
const serviceAccount = JSON.parse(serviceAccountJson ? serviceAccountJson : '{}')
let firestore: Firestore | undefined = undefined
let auth: Auth | undefined = undefined

if (currentApps.length <= 0) {
  // if (process.env.NEXT_PUBLIC_APP_ENV === 'emulator') {
  //   process.env['FUNCTIONS_EMULATOR'] = 'true'
  //   process.env['FIRESTORE_EMULATOR_HOST'] = process.env.NEXT_PUBLIC_EMULATOR_FIRESTORE_PATH
  //   process.env['FIREBASE_AUTH_EMULATOR_HOST'] = process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH
  // }

  const app = admin.initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  })
  firestore = getFirestore(app)
  auth = getAuth(app)
} else {
  firestore = getFirestore(currentApps[0])
  auth = getAuth(currentApps[0])
}

export const requireFirestore = (): Firestore => {
  if (!firestore) {
    throw new Error('Firestore is not initialized')
  }

  return firestore
}

export const requireAuth = (): Auth => {
  if (!auth) {
    throw new Error('Auth is not initialized')
  }

  return auth
}

export { firestore, auth }
