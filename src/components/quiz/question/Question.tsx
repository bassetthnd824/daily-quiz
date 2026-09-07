import classes from '@/components/quiz/question/Question.module.scss'
import QuestionTimer from '@/components/quiz/question-timer/QuestionTimer'
import Answers from '@/components/quiz/answers/Answers'
import { AnswerState } from '@/components/quiz/quiz/Quiz'
import { QuizQuestionView } from '@/models/quiz.model'
import { useRef, useState } from 'react'
import { SubmittedAnswer } from '@/models/user-answer.model'
import { CORRECT_TIME, QUESTION_TIME, SELECTED_TIME } from '@/constants/constants'

export type QuestionProps = {
  question: QuizQuestionView
  onSelectAnswer: (answer: SubmittedAnswer) => void
  onSkipAnswer: () => void
}

type Answer = {
  selectedAnswer: string
  timeToAnswer: number
}

const Question = ({ question, onSelectAnswer, onSkipAnswer }: QuestionProps) => {
  const firstRenderTime = useRef(new Date().getTime())
  const [answer, setAnswer] = useState<Answer>({
    selectedAnswer: '',
    timeToAnswer: 0,
  })

  const timer = answer.selectedAnswer ? CORRECT_TIME : QUESTION_TIME
  const answerState: AnswerState = answer.selectedAnswer ? 'answered' : ''

  const handleSelectAnswer = (selectedAnswer: string) => {
    const timeToAnswer = Math.floor((new Date().getTime() - firstRenderTime.current) / 1000)

    setAnswer({
      selectedAnswer,
      timeToAnswer,
    })

    setTimeout(() => {
      onSelectAnswer({
        questionId: question.id,
        answer: selectedAnswer,
        timeToAnswer,
      })
    }, SELECTED_TIME + CORRECT_TIME)
  }

  return (
    <div className={classes.question}>
      <QuestionTimer key={timer} timeout={timer} onTimeout={answer.selectedAnswer === '' ? onSkipAnswer : null} mode={answerState} />
      <h2>{question.text}</h2>
      <Answers answers={question.answers} selectedAnswer={answer.selectedAnswer} answerState={answerState} onSelect={handleSelectAnswer} />
    </div>
  )
}

export default Question
