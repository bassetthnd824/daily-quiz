import 'server-only'
import { DATE_FORMAT, REUSE_QUESTION_AFTER_DAYS } from '@/constants/constants'
import { requireFirestore } from '@/firebase/server'
import { Question } from '@/models/question.model'
import { QuestionStatus } from '@/models/question-status.model'
import { getCurrentDate } from '@/util/utility'
import dayjs from 'dayjs'
import { Transaction } from 'firebase-admin/firestore'

const QUESTIONS = 'questions'

const questionRef = (questionId: string) => requireFirestore().doc(`${QUESTIONS}/${questionId}`)

const toQuestion = (id: string, docData: FirebaseFirestore.DocumentData): Question => ({
  id,
  text: docData.text,
  answers: docData.answers,
  lastUsedDate: docData.lastUsedDate,
  status: docData.status,
  submittedBy: docData.submittedBy,
  dateSubmitted: docData.dateSubmitted,
})

const getEligibleQuestions = async (transaction: Transaction): Promise<Question[]> => {
  const thirtyDaysAgo = dayjs().subtract(REUSE_QUESTION_AFTER_DAYS, 'day')
  const results = await transaction.get(
    requireFirestore()
      .collection(QUESTIONS)
      .where('status', '==', QuestionStatus.ACTIVE)
      .where('lastUsedDate', '<', thirtyDaysAgo.format(DATE_FORMAT))
  )

  return results.docs.map((doc) => toQuestion(doc.id, doc.data()))
}

const setLastUsedDate = (transaction: Transaction, questions: Question[]) => {
  const lastUsedDate = getCurrentDate()

  for (const question of questions) {
    transaction.set(questionRef(question.id), { lastUsedDate }, { merge: true })
  }
}

const addQuestion = async (question: Omit<Question, 'id'>): Promise<void> => {
  await requireFirestore().collection(QUESTIONS).doc().set({ ...question })
}

export const questionDao = {
  getEligibleQuestions,
  setLastUsedDate,
  addQuestion,
}
