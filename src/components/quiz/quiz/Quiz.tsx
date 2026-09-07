'use client'

import { useCallback, useState } from 'react'
import classes from './Quiz.module.scss'
import QuestionComponent from '@/components/quiz/question/Question'
import Summary from '@/components/quiz/summary/Summary'
import { SubmittedAnswer } from '@/models/user-answer.model'
import { QuizView } from '@/models/quiz.model'
import NoQuiz from '@/components/quiz/no-quiz/NoQuiz'
import Countdown from '@/components/quiz/countdown/Countdown'
import { QUIZ_COUNTDOWN_TIME } from '@/constants/constants'

export type QuizProps = {
  quiz: QuizView
  countdown?: boolean
}

const Quiz = ({ quiz, countdown = false }: QuizProps) => {
  const [userAnswers, setUserAnswers] = useState<SubmittedAnswer[]>([])
  const [countdownComplete, setCountdownComplete] = useState(!countdown)

  const activeQuestionIndex = userAnswers.length
  const currentQuestion = quiz.questions[activeQuestionIndex]
  const noQuiz = quiz.questions.length === 0 && !quiz.summary
  const quizIsComplete = Boolean(quiz.summary) || (quiz.questions.length > 0 && activeQuestionIndex === quiz.questions.length)

  const handleSelectAnswer = useCallback((selectedAnswer: SubmittedAnswer) => {
    setUserAnswers((prevUserAnswers) => {
      return [...prevUserAnswers, selectedAnswer]
    })
  }, [])

  const handleSkipAnswer = useCallback(() => {
    if (!currentQuestion) {
      return
    }

    handleSelectAnswer({ questionId: currentQuestion.id, answer: '', timeToAnswer: 0 })
  }, [currentQuestion, handleSelectAnswer])

  const handleCountdownComplete = useCallback(() => {
    setCountdownComplete(true)
  }, [])

  if (noQuiz) {
    return <NoQuiz />
  }

  if (quizIsComplete) {
    return <Summary date={quiz.date} userAnswers={userAnswers} prevSummary={quiz.summary} />
  }

  if (!countdownComplete) {
    return (
      <div className={classes.quiz}>
        <Countdown duration={QUIZ_COUNTDOWN_TIME} onComplete={handleCountdownComplete} />
      </div>
    )
  }

  if (!currentQuestion) {
    return null
  }

  return (
    <div className={classes.quiz}>
      <QuestionComponent
        key={activeQuestionIndex}
        question={currentQuestion}
        onSelectAnswer={handleSelectAnswer}
        onSkipAnswer={handleSkipAnswer}
      />
    </div>
  )
}

export default Quiz
