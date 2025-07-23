import { firestore } from '@/firebase/server'
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

export const quizDao = {
  getQuizForDate,
  addQuiz,
}
