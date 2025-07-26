import { firestore } from '@/firebase/server'
import { QuizSummary } from '@/models/quiz-summary.model'
import { Quiz } from '@/models/quiz.model'

const QUIZZES = 'quizzes'

const getQuizForDate = async (transaction: FirebaseFirestore.Transaction, date: string): Promise<Quiz | undefined> => {
  if (!firestore) {
    return undefined
  }

  const docRef = await transaction.get(firestore.doc(`${QUIZZES}/${date}`))

  let quiz: Quiz | undefined = undefined

  if (docRef) {
    const docData = docRef.data()

    if (docData) {
      quiz = {
        date: docData.date,
        questions: [...docData.questions],
        summaries: {
          ...docData.summaries,
        },
      }
    }
  }

  return quiz
}

const addQuiz = (transaction: FirebaseFirestore.Transaction, quiz: Quiz) => {
  if (!firestore) {
    return
  }

  transaction.create(firestore?.doc(`${QUIZZES}/${quiz.date}`), { ...quiz })
}

const addQuizSummary = (transaction: FirebaseFirestore.Transaction, date: string, userId: string, quizSummary: QuizSummary) => {
  if (!firestore) {
    return
  }

  transaction.set(firestore?.doc(`${QUIZZES}/${date}`), { summaries: { [userId]: quizSummary } }, { mergeFields: [`summaries.${userId}`] })
}

export const quizDao = {
  getQuizForDate,
  addQuiz,
  addQuizSummary,
}
