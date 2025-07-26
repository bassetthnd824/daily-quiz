'use client'

import { useCallback, useState } from 'react'
import classes from './Quiz.module.scss'
import QuestionComponent from '@/components/quiz/question/Question'
import Summary from '@/components/quiz/summary/Summary'
import { UserAnswer } from '@/models/user-answer.model'
import { Quiz as QuizModel } from '@/models/quiz.model'
import { useAuth } from '@/context/user-context'

export type QuizProps = {
  quiz: QuizModel
}

export type AnswerState = '' | 'answered' | 'correct' | 'wrong'

const Quiz = ({ quiz }: QuizProps) => {
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const auth = useAuth()

  const activeQuestionIndex = userAnswers.length
  const uid = auth?.currentUser?.uid
  const quizIsComplete = quiz.summaries?.[uid!] || activeQuestionIndex === quiz.questions.length

  const handleSelectAnswer = useCallback((selectedAnswer: UserAnswer) => {
    setUserAnswers((prevUserAnswers) => {
      return [...prevUserAnswers, selectedAnswer]
    })
  }, [])

  const handleSkipAnswer = useCallback(() => handleSelectAnswer({ answer: '', timeToAnswer: 0 }), [handleSelectAnswer])

  if (quizIsComplete) {
    return <Summary userAnswers={userAnswers} questions={quiz.questions} prevSummary={quiz.summaries?.[uid!]} />
  }

  return (
    <div className={classes.quiz}>
      <QuestionComponent
        key={activeQuestionIndex}
        question={quiz.questions.length > 0 ? quiz.questions[activeQuestionIndex] : undefined}
        onSelectAnswer={handleSelectAnswer}
        onSkipAnswer={handleSkipAnswer}
      />
    </div>
  )
}

export default Quiz
