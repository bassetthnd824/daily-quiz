import { firestore } from '@/firebase/server'
import { Quiz } from '@/models/quiz.model'

const QUIZZES = 'quizzes'

const getQuizForDate = async (date: string): Promise<Quiz | undefined> => {
  const docRef = await firestore?.doc(`${QUIZZES}/${date}`).get()

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

const addQuiz = async (quiz: Quiz) => {
  await firestore?.collection(QUIZZES).add({ ...quiz })
}

export const quizDao = {
  getQuizForDate,
  addQuiz,
}
