import { quizDao } from '@/api/dao/quiz.dao'
import { getCurrentDate } from '@/util/utility'
import { questionDao } from '@/api/dao/question.dao'
import { Question } from '@/models/question.model'

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
  const questions = questionDao.getQuestions()
  console.log('eligible questions', questions)
  const randomQuestions: Question[] = []
  const usedIndecies: number[] = []

  for (let i = 0; i < MAX_DAILY_QUESTIONS; i++) {
    console.log(`iteration ${i}`)
    let index: number = 0
    let indexUsed = true;

    while (indexUsed) {
      index = Math.floor(Math.random() * questions.length)
      console.log('random index', index)
      console.log('used indecies', usedIndecies)
      indexUsed = usedIndecies.findIndex(usedIndex => usedIndex === index) >= 0
      console.log('indexUsed', indexUsed)
    }

    usedIndecies.push(index)
    randomQuestions.push(questions[index])
  }

  return randomQuestions
}

export const quizService = {
  getTodaysQuiz,
  getQuizForDate,
}
