import { collection, query, where, getDocs, and, updateDoc, doc } from 'firebase/firestore'
import { db } from './firebase.config'
import dayjs from 'dayjs'
import { DATE_FORMAT, getCurrentDate } from '@/util/utility'
import { Question } from '@/models/question.model'

const QUESTIONS = 'questions'

const getQuestions = async (): Promise<Question[]> => {
  const thirtyDaysAgo = dayjs().subtract(30, 'day')
  const q = query(collection(db, QUESTIONS), and(where('status', '==', 'A'), where('lastUsedDate', '<', thirtyDaysAgo.format(DATE_FORMAT))));

  const querySnapshot = await getDocs(q);
  const questions: Question[] = []

  querySnapshot.docs.forEach((doc) => {
    const docData = doc.data()
    console.log('docData', docData)

    questions.push({
      id: doc.id,
      answers: docData.answers,
      lastUsedDate: docData.lastUsedDate,
      status: docData.status,
      text: docData.text,
    })
  })

  console.log('questions', questions)
  return questions
}

const setLastUsedDate = async (questions: Question[]) => {
  for (const question of questions) {
    await updateDoc(doc(db, QUESTIONS, question.id), {
      lastUsedDate: getCurrentDate()
    })
  }
}

export const questionDao = {
  getQuestions,
  setLastUsedDate,
}