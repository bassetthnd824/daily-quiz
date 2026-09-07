import 'server-only'
import { quizDao } from '@/dao/quiz.dao'
import { getCurrentDate, getMonthDateRange, shuffleArray } from '@/util/utility'
import { questionDao } from '@/dao/question.dao'
import { Question } from '@/models/question.model'
import { Quiz, QuizView } from '@/models/quiz.model'
import { firestore } from '@/firebase/server'
import { SubmittedAnswer, UserAnswer } from '@/models/user-answer.model'
import { QuizSummary } from '@/models/quiz-summary.model'
import { QuizUser } from '@/models/user-profile.model'
import { LeaderboardEntry } from '@/models/leaderboard-entry.model'
import { MAX_DAILY_QUESTIONS, MAX_POINTS, QUESTION_TIME } from '@/constants/constants'

export type QuizzesParams = {
  userId?: string
  begDate?: string
  endDate?: string
}

export class QuizSubmitError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'QuizSubmitError'
    this.status = status
  }
}

const storedCorrectAnswer = (question: Question) => question.answers[0]

const maxAnswerSeconds = QUESTION_TIME / 1000
const secondsPerPoint = maxAnswerSeconds / MAX_POINTS

const pointsForCorrectAnswer = (timeToAnswer: number) => {
  const clamped = Math.min(Math.max(0, timeToAnswer), maxAnswerSeconds)
  return Math.max(0, MAX_POINTS - Math.floor(clamped / secondsPerPoint))
}

const isSubmittedAnswer = (value: unknown): value is SubmittedAnswer => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.questionId === 'string' &&
    candidate.questionId.length > 0 &&
    typeof candidate.answer === 'string' &&
    typeof candidate.timeToAnswer === 'number' &&
    Number.isFinite(candidate.timeToAnswer)
  )
}

const toQuizView = (quiz: Quiz, uid: string): QuizView => {
  const summary = quiz.summaries?.[uid]

  return {
    date: quiz.date,
    questions: summary
      ? []
      : quiz.questions.map((question) => ({
          id: question.id,
          text: question.text,
          answers: shuffleArray(question.answers),
        })),
    summary,
  }
}

const scoreAnswers = (quiz: Quiz, answers: SubmittedAnswer[]): UserAnswer[] => {
  if (answers.length !== quiz.questions.length) {
    throw new QuizSubmitError(400, 'Answer count does not match quiz')
  }

  const questionIds = new Set(answers.map((answer) => answer.questionId))
  if (questionIds.size !== answers.length) {
    throw new QuizSubmitError(400, 'Duplicate question answers')
  }

  const submittedById = new Map(answers.map((answer) => [answer.questionId, answer]))

  return quiz.questions.map((question) => {
    const submitted = submittedById.get(question.id)

    if (!submitted) {
      throw new QuizSubmitError(400, 'Missing answer for a quiz question')
    }

    const skipped = submitted.answer.trim() === ''
    const correct = !skipped && submitted.answer === storedCorrectAnswer(question)
    const status: UserAnswer['status'] = skipped ? 'skipped' : correct ? 'correct' : 'wrong'
    const bonus = status === 'correct' ? pointsForCorrectAnswer(submitted.timeToAnswer) : 0

    return {
      questionId: question.id,
      questionText: question.text,
      answer: submitted.answer,
      timeToAnswer: submitted.timeToAnswer,
      status,
      bonus,
    }
  })
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

const getQuizView = async (date: string, uid: string): Promise<QuizView | undefined> => {
  const quiz = await getQuizForDate(date)

  if (!quiz) {
    return undefined
  }

  return toQuizView(quiz, uid)
}

const getQuizzes = async ({ begDate, endDate }: QuizzesParams): Promise<Quiz[]> => {
  let quizzes: Quiz[] = []

  await firestore?.runTransaction(async (transaction) => {
    quizzes = await quizDao.getQuizzes(transaction, { begDate, endDate })
  })

  return quizzes
}

const getCompletedQuizDates = async (uid: string, { begDate, endDate }: QuizzesParams): Promise<string[]> => {
  const quizzes = await getQuizzes({ begDate, endDate })
  return quizzes.filter((quiz) => Boolean(quiz.summaries?.[uid])).map((quiz) => quiz.date)
}

const submitAnswers = async (date: string, quizUser: QuizUser, answers: unknown): Promise<QuizSummary> => {
  if (!firestore) {
    throw new QuizSubmitError(500, 'Internal Error: no firestore')
  }

  if (!Array.isArray(answers) || !answers.every(isSubmittedAnswer)) {
    throw new QuizSubmitError(400, 'Invalid answers')
  }

  if (date !== getCurrentDate()) {
    throw new QuizSubmitError(403, 'Quiz is not open for scoring')
  }

  return firestore.runTransaction(async (transaction) => {
    const quiz = await quizDao.getQuizForDate(transaction, date)

    if (!quiz || quiz.questions.length === 0) {
      throw new QuizSubmitError(404, 'Quiz not found')
    }

    const existing = quiz.summaries?.[quizUser.uid]
    if (existing) {
      return existing
    }

    const scoredAnswers = scoreAnswers(quiz, answers)
    const skippedCount = scoredAnswers.filter((answer) => answer.status === 'skipped').length
    const correctCount = scoredAnswers.filter((answer) => answer.status === 'correct').length
    const total = scoredAnswers.length
    const skippedAnswersShare = Math.round((skippedCount / total) * 100)
    const correctAnswersShare = Math.round((correctCount / total) * 100)
    const quizSummary: QuizSummary = {
      skippedAnswersShare,
      correctAnswersShare,
      wrongAnswersShare: 100 - skippedAnswersShare - correctAnswersShare,
      answers: scoredAnswers,
      score: scoredAnswers.reduce((sum, answer) => sum + (answer.bonus ?? 0), 0),
      user: {
        displayName: quizUser.nickname ? quizUser.nickname : quizUser.displayName,
        photoURL: quizUser.photoURL,
      },
    }

    quizDao.addQuizSummary(transaction, date, quizUser.uid, quizSummary)
    return quizSummary
  })
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
  getQuizView,
  getCompletedQuizDates,
  submitAnswers,
  getLeaderboard,
}
