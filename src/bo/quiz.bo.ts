import 'server-only'
import { MAX_DAILY_QUESTIONS, MAX_POINTS, QUESTION_TIME } from '@/constants/constants'
import { questionDao } from '@/dao/question.dao'
import { quizDao } from '@/dao/quiz.dao'
import { requireFirestore } from '@/firebase/server'
import { LeaderboardEntry } from '@/models/leaderboard-entry.model'
import { Question } from '@/models/question.model'
import { DateRange, Quiz, QuizView } from '@/models/quiz.model'
import { QuizSummary } from '@/models/quiz-summary.model'
import { SubmittedAnswer, UserAnswer } from '@/models/user-answer.model'
import { QuizUser } from '@/models/user-profile.model'
import { getCurrentDate, isWeekday, shuffleArray, yearMonthFromDate } from '@/util/utility'
import { Transaction } from 'firebase-admin/firestore'

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

const emptyQuizView = (date: string): QuizView => ({
  date,
  questions: [],
})

const pickRandomQuestions = async (transaction: Transaction): Promise<Question[]> => {
  const eligible = await questionDao.getEligibleQuestions(transaction)
  return shuffleArray(eligible).slice(0, MAX_DAILY_QUESTIONS)
}

const getQuizView = async (date: string, uid: string): Promise<QuizView | undefined> => {
  const quiz = await quizDao.getQuiz(date)

  if (!quiz) {
    return undefined
  }

  return toQuizView(quiz, uid)
}

const ensureTodaysQuiz = async (uid: string): Promise<QuizView> => {
  const db = requireFirestore()
  const date = getCurrentDate()

  if (!isWeekday(date)) {
    return emptyQuizView(date)
  }

  const quiz = await db.runTransaction(async (transaction) => {
    const existing = await quizDao.getQuizInTransaction(transaction, date)

    if (existing) {
      return existing
    }

    const questions = await pickRandomQuestions(transaction)

    if (questions.length === 0) {
      return undefined
    }

    const created: Quiz = {
      questions,
      date,
    }

    quizDao.createQuiz(transaction, created)

    if (process.env.NEXT_PUBLIC_APP_ENV !== 'emulator') {
      questionDao.setLastUsedDate(transaction, questions)
    }

    return created
  })

  if (!quiz) {
    return emptyQuizView(date)
  }

  return toQuizView(quiz, uid)
}

const getCompletedQuizDates = async (uid: string, range: DateRange): Promise<string[]> => {
  const quizzes = await quizDao.listQuizSummaries(range)
  return quizzes.filter((quiz) => Boolean(quiz.summaries[uid])).map((quiz) => quiz.date)
}

const submitAnswers = async (date: string, quizUser: QuizUser, answers: unknown): Promise<QuizSummary> => {
  const db = requireFirestore()

  if (!Array.isArray(answers) || !answers.every(isSubmittedAnswer)) {
    throw new QuizSubmitError(400, 'Invalid answers')
  }

  if (date !== getCurrentDate()) {
    throw new QuizSubmitError(403, 'Quiz is not open for scoring')
  }

  return db.runTransaction(async (transaction) => {
    const quiz = await quizDao.getQuizInTransaction(transaction, date)

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
    const score = scoredAnswers.reduce((sum, answer) => sum + (answer.bonus ?? 0), 0)
    const displayName = quizUser.nickname ? quizUser.nickname : quizUser.displayName
    const quizSummary: QuizSummary = {
      skippedAnswersShare,
      correctAnswersShare,
      wrongAnswersShare: 100 - skippedAnswersShare - correctAnswersShare,
      answers: scoredAnswers,
      score,
      user: {
        displayName,
        photoURL: quizUser.photoURL,
      },
    }

    quizDao.setQuizSummary(transaction, date, quizUser.uid, quizSummary)
    quizDao.incrementLeaderboard(transaction, yearMonthFromDate(date), {
      userId: quizUser.uid,
      displayName,
      photoURL: quizUser.photoURL,
      totalScore: score,
    })

    return quizSummary
  })
}

const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  return quizDao.listLeaderboard(yearMonthFromDate(getCurrentDate()))
}

export const quizService = {
  getQuizView,
  ensureTodaysQuiz,
  getCompletedQuizDates,
  submitAnswers,
  getLeaderboard,
}
