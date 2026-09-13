import { getApps, initializeApp } from 'firebase-admin/app'
import { auth } from 'firebase-functions/v1'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { createTodaysQuiz } from './create-todays-quiz.js'
import { seedUserProfile } from './seed-user-profile.js'

if (getApps().length === 0) {
  initializeApp()
}

export { createTodaysQuiz, seedUserProfile }

export const createDailyQuiz = onSchedule(
  {
    schedule: '0 5 * * 1-5',
    timeZone: 'America/Chicago',
    region: 'us-central1',
  },
  async () => {
    process.env.TZ = 'America/Chicago'
    await createTodaysQuiz()
  },
)

export const onUserCreate = auth.user().onCreate(seedUserProfile)
