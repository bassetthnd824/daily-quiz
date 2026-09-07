import 'server-only'
import { QuizzesParams } from '@/bo/quiz.bo'
import { firestore } from '@/firebase/server'
import { QuizSummary } from '@/models/quiz-summary.model'
import { Quiz } from '@/models/quiz.model'

const QUIZZES = 'quizzes'

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

const getQuiz = async (date: string): Promise<Quiz | undefined> => {
  if (!firestore) {
    return undefined
  }

  const snapshot = await firestore.doc(`${QUIZZES}/${date}`).get()

  if (!snapshot.exists) {
    return undefined
  }

  return toQuiz(snapshot.data())
}

const getQuizForDate = async (transaction: FirebaseFirestore.Transaction, date: string): Promise<Quiz | undefined> => {
  if (!firestore) {
    return undefined
  }

  const snapshot = await transaction.get(firestore.doc(`${QUIZZES}/${date}`))

  if (!snapshot.exists) {
    return undefined
  }

  return toQuiz(snapshot.data())
}

const getQuizzes = async (transaction: FirebaseFirestore.Transaction, { begDate, endDate }: QuizzesParams): Promise<Quiz[]> => {
  if (!firestore) {
    return []
  }

  const results = await transaction.get(firestore.collection(QUIZZES).where('date', '>=', begDate).where('date', '<=', endDate))
  let quizzes: Quiz[] = []

  if (results) {
    quizzes = results.docs.map((doc) => {
      const docData = doc.data()
      return {
        date: docData.date,
        questions: [...(docData.questions ?? [])],
        summaries: { ...(docData.summaries ?? {}) },
      }
    })
  }

  return quizzes
}

const addQuiz = (transaction: FirebaseFirestore.Transaction, quiz: Quiz) => {
  if (!firestore) {
    return
  }

  transaction.create(firestore.doc(`${QUIZZES}/${quiz.date}`), { ...quiz })
}

const addQuizSummary = (transaction: FirebaseFirestore.Transaction, date: string, userId: string, quizSummary: QuizSummary) => {
  if (!firestore) {
    return
  }

  transaction.set(firestore.doc(`${QUIZZES}/${date}`), { summaries: { [userId]: quizSummary } }, { mergeFields: [`summaries.${userId}`] })
}

export const quizDao = {
  getQuiz,
  getQuizForDate,
  getQuizzes,
  addQuiz,
  addQuizSummary,
}
