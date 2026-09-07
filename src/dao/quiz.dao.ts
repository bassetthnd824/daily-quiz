import 'server-only'
import { requireFirestore } from '@/firebase/server'
import { LeaderboardEntry } from '@/models/leaderboard-entry.model'
import { DateRange, Quiz } from '@/models/quiz.model'
import { QuizSummary } from '@/models/quiz-summary.model'
import { FieldValue, Transaction } from 'firebase-admin/firestore'

const QUIZZES = 'quizzes'
const LEADERBOARD = 'leaderboard'

const toQuiz = (docData: FirebaseFirestore.DocumentData | undefined): Quiz | undefined => {
  if (!docData) {
    return undefined
  }

  return {
    date: docData.date,
    questions: [...(docData.questions ?? [])],
    summaries: { ...(docData.summaries ?? {}) },
  }
}

const quizRef = (date: string) => requireFirestore().doc(`${QUIZZES}/${date}`)

const leaderboardEntryRef = (yearMonth: string, userId: string) =>
  requireFirestore().doc(`${LEADERBOARD}/${yearMonth}/entries/${userId}`)

const getQuiz = async (date: string): Promise<Quiz | undefined> => {
  const snapshot = await quizRef(date).get()

  if (!snapshot.exists) {
    return undefined
  }

  return toQuiz(snapshot.data())
}

const getQuizInTransaction = async (transaction: Transaction, date: string): Promise<Quiz | undefined> => {
  const snapshot = await transaction.get(quizRef(date))

  if (!snapshot.exists) {
    return undefined
  }

  return toQuiz(snapshot.data())
}

const listQuizSummaries = async ({ begDate, endDate }: DateRange): Promise<{ date: string; summaries: Record<string, QuizSummary> }[]> => {
  const results = await requireFirestore()
    .collection(QUIZZES)
    .where('date', '>=', begDate)
    .where('date', '<=', endDate)
    .select('date', 'summaries')
    .get()

  return results.docs.map((doc) => {
    const docData = doc.data()
    return {
      date: docData.date,
      summaries: { ...(docData.summaries ?? {}) },
    }
  })
}

const createQuiz = (transaction: Transaction, quiz: Quiz) => {
  transaction.create(quizRef(quiz.date), { ...quiz })
}

const setQuizSummary = (transaction: Transaction, date: string, userId: string, quizSummary: QuizSummary) => {
  transaction.set(quizRef(date), { summaries: { [userId]: quizSummary } }, { mergeFields: [`summaries.${userId}`] })
}

const incrementLeaderboard = (transaction: Transaction, yearMonth: string, entry: LeaderboardEntry) => {
  transaction.set(
    leaderboardEntryRef(yearMonth, entry.userId),
    {
      userId: entry.userId,
      displayName: entry.displayName,
      photoURL: entry.photoURL,
      totalScore: FieldValue.increment(entry.totalScore),
    },
    { merge: true }
  )
}

const listLeaderboard = async (yearMonth: string): Promise<LeaderboardEntry[]> => {
  const results = await requireFirestore().collection(`${LEADERBOARD}/${yearMonth}/entries`).orderBy('totalScore', 'desc').get()

  return results.docs.map((doc) => {
    const docData = doc.data()
    return {
      userId: doc.id,
      displayName: docData.displayName,
      photoURL: docData.photoURL,
      totalScore: docData.totalScore,
    }
  })
}

export const quizDao = {
  getQuiz,
  getQuizInTransaction,
  listQuizSummaries,
  createQuiz,
  setQuizSummary,
  incrementLeaderboard,
  listLeaderboard,
}
