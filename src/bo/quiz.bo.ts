import { quizDao } from '@/dao/quiz.dao'
import { getCurrentDate, getMonthDateRange, shuffleArray } from '@/util/utility'
import { questionDao } from '@/dao/question.dao'
import { Question } from '@/models/question.model'
import { Quiz } from '@/models/quiz.model'
import { firestore } from '@/firebase/server'
import { UserAnswer } from '@/models/user-answer.model'
import { QuizSummary } from '@/models/quiz-summary.model'
import { QuizUser } from '@/models/user-profile.model'
import { LeaderboardEntry } from '@/models/leaderboard-entry.model'
import { MAX_DAILY_QUESTIONS, QUESTION_TIME } from '@/constants/constants'

export type QuizzesParams = {
  userId?: string
  begDate?: string
  endDate?: string
}

const getTodaysQuiz = async (): Promise<Quiz | undefined> => {
  return getQuizForDate(getCurrentDate())
}

const getQuizForDate = async (date: string): Promise<Quiz | undefined> => {
  let quiz: Quiz | undefined

  await firestore?.runTransaction(async (transaction) => {
    quiz = await quizDao.getQuizForDate(transaction, date)

    if (!quiz) {
      quiz = {
        questions: await getRandomQuestions(transaction),
        date: getCurrentDate(),
      }

      if (quiz.questions.length === 0) {
        return
      }

      quizDao.addQuiz(transaction, quiz)
      if (process.env.NEXT_PUBLIC_APP_ENV !== 'emulator') {
        questionDao.setLastUsedDate(transaction, quiz.questions)
      }
    }
  })

  return quiz
}

const getQuizzes = async ({ begDate, endDate }: QuizzesParams): Promise<Quiz[]> => {
  let quizzes: Quiz[] = []

  await firestore?.runTransaction(async (transaction) => {
    quizzes = await quizDao.getQuizzes(transaction, { begDate, endDate })
  })

  return quizzes
}

export const getQuizResults = async (
  date: string,
  quizUser: QuizUser,
  { userAnswers, questions }: { userAnswers: UserAnswer[]; questions: Question[] }
): Promise<QuizSummary> => {
  const skippedAnswers = userAnswers.filter((answer) => !answer.answer)
  const correctAnswers = userAnswers.filter((answer, index) => answer.answer === questions[index].answers[0])

  const skippedAnswersShare = Math.round((skippedAnswers.length / userAnswers.length) * 100)
  const correctAnswersShare = Math.round((correctAnswers.length / userAnswers.length) * 100)
  const wrongAnswersShare = 100 - skippedAnswersShare - correctAnswersShare
  let score = 0

  userAnswers.forEach((answer, index) => {
    answer.questionText = questions[index].text

    if (!answer.answer) {
      answer.status = 'skipped'
    } else if (answer.answer === questions[index].answers[0]) {
      answer.status = 'correct'
    } else {
      answer.status = 'wrong'
    }

    answer.bonus = answer.status === 'correct' ? QUESTION_TIME / 2000 - answer.timeToAnswer : 0

    score += answer.status === 'correct' ? answer.bonus : 0
  }, 0)

  const quizSummary: QuizSummary = {
    skippedAnswersShare,
    correctAnswersShare,
    wrongAnswersShare,
    answers: userAnswers,
    score,
    user: {
      displayName: quizUser.nickname ? quizUser.nickname : quizUser.displayName,
      photoURL: quizUser.photoURL,
    },
  }

  await firestore?.runTransaction(async (transaction) => {
    quizDao.addQuizSummary(transaction, date, quizUser.uid, quizSummary)
  })

  return quizSummary
}

const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const results: Map<string, LeaderboardEntry> = new Map<string, LeaderboardEntry>()

  let quizzes: Quiz[] = []
  await firestore?.runTransaction(async (transaction) => {
    quizzes = await quizDao.getQuizzes(transaction, getMonthDateRange())
  })

  quizzes.forEach((quiz) => {
    if (quiz.summaries) {
      Object.entries(quiz.summaries).forEach(([key, value]) => {
        if (results.has(key)) {
          let entry = results.get(key)
          if (entry) {
            entry.totalScore += value.score
          } else {
            entry = {
              userId: key,
              displayName: value.user.displayName,
              photoURL: value.user.photoURL,
              totalScore: value.score,
            }
            results.set(key, entry)
          }
        } else {
          const entry = {
            userId: key,
            displayName: value.user.displayName,
            photoURL: value.user.photoURL,
            totalScore: value.score,
          }
          results.set(key, entry)
        }
      })
    }
  })

  return [...results.values()].sort((a, b) => b.totalScore - a.totalScore)
}

const getRandomQuestions = async (transaction: FirebaseFirestore.Transaction): Promise<Question[]> => {
  const randomQuestions = shuffleArray(await questionDao.getQuestions(transaction))
  return randomQuestions.slice(0, MAX_DAILY_QUESTIONS)
}

export const quizService = {
  getTodaysQuiz,
  getQuizForDate,
  getQuizzes,
  getQuizResults,
  getLeaderboard,
}
