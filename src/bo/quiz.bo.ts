import { quizDao } from '@/dao/quiz.dao'
import { getCurrentDate, shuffleArray } from '@/util/utility'
import { questionDao } from '@/dao/question.dao'
import { Question } from '@/models/question.model'
import { QUESTION_TIME, Quiz } from '@/models/quiz.model'
import { firestore } from '@/firebase/server'
import { UserAnswer } from '@/models/user-answer.model'
import { QuizSummary } from '@/models/quiz-summary.model'

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

export const getQuizResults = async (
  date: string,
  userId: string,
  { userAnswers, questions }: { userAnswers: UserAnswer[]; questions: Question[] }
): Promise<QuizSummary> => {
  const skippedAnswers = userAnswers.filter((answer) => !answer.answer)
  const correctAnswers = userAnswers.filter((answer, index) => answer.answer === questions[index].answers[0])

  const skippedAnswersShare = Math.round((skippedAnswers.length / userAnswers.length) * 100)
  const correctAnswersShare = Math.round((correctAnswers.length / userAnswers.length) * 100)
  const wrongAnswersShare = 100 - skippedAnswersShare - correctAnswersShare
  let score = 0

  userAnswers.forEach((answer, index) => {
    answer.questionText = questions[index].answers[0]

    if (!answer.answer) {
      answer.status = 'skipped'
    } else if (answer.answer === questions[index].answers[0]) {
      answer.status = 'correct'
    } else {
      answer.status = 'wrong'
    }

    answer.bonus = answer.status === 'correct' ? QUESTION_TIME / 1000 - answer.timeToAnswer : 0

    score += answer.status === 'correct' ? answer.bonus : 0
  }, 0)

  const quizSummary: QuizSummary = {
    skippedAnswersShare,
    correctAnswersShare,
    wrongAnswersShare,
    answers: userAnswers,
    score,
  }

  try {
    await firestore?.runTransaction(async (transaction) => {
      quizDao.addQuizSummary(transaction, date, userId, quizSummary)
    })
  } catch (error) {
    console.error('Transaction failed', error)
  }

  return quizSummary
}

const getRandomQuestions = async (transaction: FirebaseFirestore.Transaction): Promise<Question[]> => {
  const randomQuestions = shuffleArray(await questionDao.getQuestions(transaction))
  return randomQuestions.slice(0, MAX_DAILY_QUESTIONS)
}

export const quizService = {
  getTodaysQuiz,
  getQuizForDate,
  getQuizResults,
}
