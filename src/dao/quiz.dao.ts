import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { Quiz } from '@/models/quiz.model'
import { db } from '@/dao/firebase.config'

const QUIZZES = 'quizzes'

const getQuizForDate = async (date: string): Promise<Quiz | undefined> => {
   const q = query(collection(db, QUIZZES), where('date', '==', date))
  
    const querySnapshot = await getDocs(q);
    let quiz: Quiz | undefined = undefined
  
    querySnapshot.forEach(doc => {
      const docData = doc.data()

      quiz = {
        date: docData.date,
        questions: [...docData.questions],
      }
    })

    return quiz
}

const addQuiz = async (quiz: Quiz) => {
  await setDoc(doc(db, QUIZZES, quiz.date), { ...quiz })
}

export const quizDao = {
  getQuizForDate,
  addQuiz,
}
