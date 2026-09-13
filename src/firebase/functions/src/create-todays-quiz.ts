import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import { daysBefore, isoDateToday, isWeekday, shuffle } from './quiz-utils.js'

const QUESTIONS = 'questions'
const QUIZZES = 'quizzes'
const ACTIVE_STATUS = 'A'
export const MAX_DAILY_QUESTIONS = 10
export const REUSE_QUESTION_AFTER_DAYS = 30

type EligibleQuestion = {
  id: string
  text: string
  answers: string[]
  lastUsedDate: string
  status: string
  submittedBy: string
  dateSubmitted: string
}

export const createTodaysQuiz = async (now = new Date()): Promise<void> => {
  const date = isoDateToday(now)

  if (!isWeekday(date)) {
    logger.info('Skipping quiz creation on the weekend', { date })
    return
  }

  const db = getFirestore()
  const cutoff = daysBefore(date, REUSE_QUESTION_AFTER_DAYS)

  await db.runTransaction(async (transaction) => {
    const quizRef = db.doc(`${QUIZZES}/${date}`)
    const existing = await transaction.get(quizRef)

    if (existing.exists) {
      logger.info('Quiz already exists', { date })
      return
    }

    const eligible = await transaction.get(
      db.collection(QUESTIONS).where('status', '==', ACTIVE_STATUS).where('lastUsedDate', '<', cutoff),
    )

    const questions: EligibleQuestion[] = shuffle(
      eligible.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          text: data.text,
          answers: data.answers,
          lastUsedDate: data.lastUsedDate,
          status: data.status,
          submittedBy: data.submittedBy,
          dateSubmitted: data.dateSubmitted,
        }
      }),
    ).slice(0, MAX_DAILY_QUESTIONS)

    if (questions.length === 0) {
      logger.warn("No eligible questions for today's quiz", { date })
      return
    }

    transaction.create(quizRef, { date, questions })

    for (const question of questions) {
      transaction.set(db.doc(`${QUESTIONS}/${question.id}`), { lastUsedDate: date }, { merge: true })
    }

    logger.info("Created today's quiz", {
      date,
      questionCount: questions.length,
    })
  })
}
