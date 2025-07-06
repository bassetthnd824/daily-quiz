import { collection, query, where, getDocs, and } from 'firebase/firestore'
import { db } from './firebase.config'
import dayjs from 'dayjs'
import { DATE_FORMAT } from '@/util/utility'
import { Question } from '@/models/question.model'

const getQuestions = async (): Promise<Question[]> => {
  const thirtyDaysAgo = dayjs().subtract(30, 'day')
  const q = query(collection(db, 'questions'), and(where('status', '==', 'A'), where('lastUsedDate', '<', thirtyDaysAgo.format(DATE_FORMAT))));

  const querySnapshot = await getDocs(q);
  const questions: Question[] = []

  querySnapshot.forEach((doc) => {
    const docData = doc.data()

    questions.push({
      id: docData.id,
      answers: docData.answers,
      lastUsedDate: docData.lastUsedDate,
      status: docData.status,
      text: docData.text,
    })
  });

  return questions
}

export const questionDao = {
  getQuestions,
}