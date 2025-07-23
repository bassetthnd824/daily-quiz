import { quizDao } from '@/dao/quiz.dao'
import { getCurrentDate } from '@/util/utility'
import { questionDao } from '@/dao/question.dao'
import { Question } from '@/models/question.model'
import { Quiz } from '@/models/quiz.model'
import { firestore } from '@/firebase/server'

const MAX_DAILY_QUESTIONS = 10

const getTodaysQuiz = async (): Promise<Quiz | undefined> => {
  return getQuizForDate(getCurrentDate())
}

const getQuizForDate = async (date: string): Promise<Quiz | undefined> => {
  let quiz: Quiz | undefined

  try {
    await firestore?.runTransaction(async (transaction) => {
      quiz = await quizDao.getQuizForDate(transaction, date)

      if (!quiz) {
        quiz = {
          questions: await getRandomQuestions(transaction),
          date: getCurrentDate(),
        }

        quizDao.addQuiz(transaction, quiz)
        if (process.env.NEXT_PUBLIC_APP_ENV !== 'emulator') {
          questionDao.setLastUsedDate(transaction, quiz.questions)
        }
      }
    })
  } catch (error) {
    console.error('Transaction failed', error)
  }

  return quiz
}

const getRandomQuestions = async (transaction: FirebaseFirestore.Transaction): Promise<Question[]> => {
  const randomQuestions = [...(await questionDao.getQuestions(transaction))]
  randomQuestions.sort(() => Math.random() - 0.5)
  return randomQuestions.slice(0, MAX_DAILY_QUESTIONS)
}

export const quizService = {
  getTodaysQuiz,
  getQuizForDate,
}
