import { questionDao } from '@/dao/question.dao'
import { Question } from '@/models/question.model'
import { firestore } from '@/firebase/server'

const addQuestion = async (question: Omit<Question, 'id'>): Promise<void> => {
  await firestore?.runTransaction(async (transaction) => {
    questionDao.addQuestion(transaction, question)
  })
}

export const questionService = {
  addQuestion,
}
