import admin from 'firebase-admin'
import { cert, getApps, ServiceAccount } from 'firebase-admin/app'
import { Firestore, getFirestore } from 'firebase-admin/firestore'
import serviceAccount from './serviceAccount.json'
import { Auth, getAuth } from 'firebase-admin/auth'

const SESSION_COOKIE = 'daily-quiz-session'
const currentApps = getApps()
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

export { firestore, auth, SESSION_COOKIE }
