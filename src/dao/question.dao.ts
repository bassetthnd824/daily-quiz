import { firestore } from '@/firebase/server'
import dayjs from 'dayjs'
import { getCurrentDate } from '@/util/utility'
import { Question } from '@/models/question.model'
import { DATE_FORMAT, REUSE_QUESTION_AFTER_DAYS } from '@/constants/constants'

const QUESTIONS = 'questions'

const getQuestions = async (transaction: FirebaseFirestore.Transaction): Promise<Question[]> => {
  if (!firestore) {
    return []
  }

  const thirtyDaysAgo = dayjs().subtract(REUSE_QUESTION_AFTER_DAYS, 'day')
  const results = await transaction.get(
    firestore.collection(QUESTIONS).where('status', '==', 'A').where('lastUsedDate', '<', thirtyDaysAgo.format(DATE_FORMAT))
  )
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
        submittedBy: docData.submittedBy,
        dateSubmitted: docData.dateSubmitted,
      }
    })
  }

  return questions
}

const setLastUsedDate = (transaction: FirebaseFirestore.Transaction, questions: Question[]) => {
  if (!firestore) {
    return
  }

  for (const question of questions) {
    transaction.set(firestore.doc(`${QUESTIONS}/${question.id}`), { lastUsedDate: getCurrentDate() }, { merge: true })
  }
}

const addQuestion = (transaction: FirebaseFirestore.Transaction, question: Omit<Question, 'id'>) => {
  if (!firestore) {
    return
  }

  transaction.set(firestore?.collection(QUESTIONS).doc(), { ...question })
}

export const questionDao = {
  getQuestions,
  setLastUsedDate,
  addQuestion,
}
