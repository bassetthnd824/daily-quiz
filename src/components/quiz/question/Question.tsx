'use client'

import classes from '@/components/quiz/question/Question.module.scss'
import QuestionTimer from '@/components/quiz/question-timer/QuestionTimer'
import Answers from '@/components/quiz/answers/Answers'
import { AnswerState } from '@/components/quiz/answer-state'
import { QuizQuestionView } from '@/models/quiz.model'
import { useEffect, useRef, useState } from 'react'
import { SubmittedAnswer } from '@/models/user-answer.model'
import { CORRECT_TIME, QUESTION_TIME, SELECTED_TIME } from '@/constants/constants'

export type QuestionProps = {
  question: QuizQuestionView
  onSelectAnswer: (answer: SubmittedAnswer) => void
  onSkipAnswer: () => void
}

type Phase = 'idle' | 'selected'

const HOLD_TIME = SELECTED_TIME + CORRECT_TIME

const Question = ({ question, onSelectAnswer, onSkipAnswer }: QuestionProps) => {
  const firstRenderTime = useRef(new Date().getTime())
  const [phase, setPhase] = useState<Phase>('idle')
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [timeToAnswer, setTimeToAnswer] = useState(0)
  const answerState: AnswerState = phase === 'selected' ? 'answered' : ''

  useEffect(() => {
    if (phase !== 'selected') {
      return
    }

    const timer = setTimeout(() => {
      onSelectAnswer({
        questionId: question.id,
        answer: selectedAnswer,
        timeToAnswer,
      })
    }, HOLD_TIME)

    return () => {
      clearTimeout(timer)
    }
  }, [phase, question.id, selectedAnswer, timeToAnswer, onSelectAnswer])

  const handleSelectAnswer = (answer: string) => {
    if (phase !== 'idle') {
      return
    }

    setTimeToAnswer(Math.floor((new Date().getTime() - firstRenderTime.current) / 1000))
    setSelectedAnswer(answer)
    setPhase('selected')
  }

  return (
    <div className={classes.question}>
      <QuestionTimer timeout={QUESTION_TIME} running={phase === 'idle'} onTimeout={onSkipAnswer} mode={answerState} />
      <h2>{question.text}</h2>
      <Answers answers={question.answers} selectedAnswer={selectedAnswer} answerState={answerState} onSelect={handleSelectAnswer} />
    </div>
  )
}

export default Question
