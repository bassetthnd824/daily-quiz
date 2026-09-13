import { getApps, initializeApp } from 'firebase-admin/app'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { createTodaysQuiz } from './create-todays-quiz.js'

if (getApps().length === 0) {
  initializeApp()
}

export { createTodaysQuiz }

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
