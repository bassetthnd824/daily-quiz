import { QuestionStatus } from '@/models/question-status.model'
import { Question } from '@/models/question.model'
import { Quiz } from '@/models/quiz.model'
import { QuizSummary } from '@/models/quiz-summary.model'
import { QuizUser } from '@/models/user-profile.model'

export const quizUser: QuizUser = {
  uid: 'user-1',
  email: 'ada@example.com',
  emailVerified: true,
  phoneNumber: undefined,
  displayName: 'Ada Lovelace',
  photoURL: 'https://example.com/ada.png',
  isAdmin: false,
  canSubmitQuestions: true,
  nickname: 'Ada',
}

export const adminUser: QuizUser = {
  ...quizUser,
  uid: 'admin-1',
  isAdmin: true,
}

export const makeQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: 'q1',
  text: 'What is 2 + 2?',
  answers: ['4', '3', '5', '22'],
  lastUsedDate: '1111-11-11',
  status: QuestionStatus.ACTIVE,
  submittedBy: 'Ada',
  dateSubmitted: '2026-09-01',
  ...overrides,
})

export const makeQuiz = (overrides: Partial<Quiz> = {}): Quiz => ({
  date: '2026-09-07',
  questions: [
    makeQuestion({ id: 'q1', text: 'What is 2 + 2?', answers: ['4', '3', '5'] }),
    makeQuestion({ id: 'q2', text: 'Capital of France?', answers: ['Paris', 'Lyon', 'Nice'] }),
  ],
  ...overrides,
})

export const makeSummary = (overrides: Partial<QuizSummary> = {}): QuizSummary => ({
  skippedAnswersShare: 0,
  correctAnswersShare: 100,
  wrongAnswersShare: 0,
  score: 20,
  answers: [],
  user: {
    displayName: 'Ada',
    photoURL: 'https://example.com/ada.png',
  },
  ...overrides,
})
