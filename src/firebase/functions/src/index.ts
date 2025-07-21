const serviceAccount = require('../serviceAccount.json')
const admin = require('firebase-admin')
import { auth } from 'firebase-functions/v1'

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG!)
adminConfig.credential = admin.credential.cert(serviceAccount)
admin.initializeApp(adminConfig)

export const onUserCreate = auth.user().onCreate(async (user) => {
  await admin.firestore().doc(`users/${user.uid}`).create({
    isAdmin: false,
    canSubmitQuestions: true,
  })
})
