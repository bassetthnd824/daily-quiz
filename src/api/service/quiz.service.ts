import { quizDao } from '@/api/dao/quiz.dao'
import { getCurrentDate } from '@/util/utility'
import { questionDao } from '@/api/dao/question.dao'

const MAX_DAILY_QUESTIONS = 5

const getTodaysQuiz = () => {
  return getQuizForDate(getCurrentDate())
}

const getQuizForDate = (date: string) => {
  console.log('date', date)
  let quiz = quizDao.getQuizForDate(date)
  console.log('quiz', quiz)
  if (!quiz) {
    quiz = {
      questions: getRandomQuestions(),
      date: getCurrentDate(),
    }

    quizDao.addQuiz(quiz)
  }

  return quiz
}

const getRandomQuestions = () => {
  const randomQuestions = [...questionDao.getQuestions()]
  randomQuestions.sort(() => Math.random() - 0.5)

  return randomQuestions.slice(0, MAX_DAILY_QUESTIONS)
}

export const quizService = {
  getTodaysQuiz,
  getQuizForDate,
}
