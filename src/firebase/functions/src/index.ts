import { getApps, initializeApp } from 'firebase-admin/app'
import { beforeUserCreated } from 'firebase-functions/v2/identity'
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

export const onUserCreate = beforeUserCreated({ region: 'us-central1' }, async (event) => {
  if (!event.data) {
    return
  }

  await seedUserProfile(event.data)
})
