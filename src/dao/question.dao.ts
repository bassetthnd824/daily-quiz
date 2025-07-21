import { firestore } from '@/firebase/server'
import dayjs from 'dayjs'
import { DATE_FORMAT, getCurrentDate } from '@/util/utility'
import { Question } from '@/models/question.model'

const QUESTIONS = 'questions'

const getQuestions = async (): Promise<Question[]> => {
  const thirtyDaysAgo = dayjs().subtract(30, 'day')
  const results = await firestore
    ?.collection(QUESTIONS)
    .where('status', '==', 'A')
    .where('lastUsedDate', '<', thirtyDaysAgo.format(DATE_FORMAT))
    .get()
  let questions: Question[] = []

  if (results) {
    questions = results.docs.map((doc) => {
      const docData = doc.data()
      return {
        id: doc.id,
        text: docData.text,
        answers: docData.answers,
        lastUsedDate: docData.lastUsedDate,
        status: docData.status,
      }
    })
  }

  return questions
}

const setLastUsedDate = async (questions: Question[]) => {
  for (const question of questions) {
    await firestore?.doc(`${QUESTIONS}/${question.id}`).set({ lastUsedDate: getCurrentDate() }, { merge: true })
  }
}

export const questionDao = {
  getQuestions,
  setLastUsedDate,
}
