import { quizDao } from '@/dao/quiz.dao'
import { getCurrentDate } from '@/util/utility'
import { questionDao } from '@/dao/question.dao'
import { Question } from '@/models/question.model'
import { Quiz } from '@/models/quiz.model'

const MAX_DAILY_QUESTIONS = 5

const getTodaysQuiz = async (): Promise<Quiz> => {
  return getQuizForDate(getCurrentDate())
}

const getQuizForDate = async (date: string): Promise<Quiz> => {
  let quiz = await quizDao.getQuizForDate(date)

  if (!quiz) {
    quiz = {
      questions: await getRandomQuestions(),
      date: getCurrentDate(),
    }

    quizDao.addQuiz(quiz)
    questionDao.setLastUsedDate(quiz.questions)
  }

  return quiz
}

const getRandomQuestions = async (): Promise<Question[]> => {
  const randomQuestions = [...await questionDao.getQuestions()]
  randomQuestions.sort(() => Math.random() - 0.5)

  return randomQuestions.slice(0, MAX_DAILY_QUESTIONS)
}

export const quizService = {
  getTodaysQuiz,
  getQuizForDate,
}
