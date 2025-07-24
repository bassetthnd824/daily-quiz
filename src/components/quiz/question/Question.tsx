import classes from '@/components/quiz/question/Question.module.scss'
import QuestionTimer from '@/components/quiz/question-timer/QuestionTimer'
import Answers from '@/components/quiz/answers/Answers'
import { AnswerState, CORRECT_TIME, QUESTION_TIME, SELECTED_TIME } from '@/components/quiz/quiz/Quiz'
import { Question as QuestionModel } from '@/models/question.model'
import { useRef, useState } from 'react'
import { UserAnswer } from '@/models/user-answer.model'

export type QuestionProps = {
  question?: QuestionModel
  onSelectAnswer: (answer: UserAnswer) => void
  onSkipAnswer: () => void
}

type Answer = {
  selectedAnswer: string
  isCorrect: boolean | null
  timeToAnswer: number
}

const Question = ({ question, onSelectAnswer, onSkipAnswer }: QuestionProps) => {
  const firstRenderTime = useRef(new Date().getTime())
  const [answer, setAnswer] = useState<Answer>({
    selectedAnswer: '',
    isCorrect: null,
    timeToAnswer: 0,
  })

  let timer = QUESTION_TIME

  if (answer.selectedAnswer) {
    timer = CORRECT_TIME
  }

  if (answer.isCorrect !== null) {
    timer = SELECTED_TIME
  }

  const handleSelectAnswer = (answer: string) => {
    const timeToAnswer = Math.floor((new Date().getTime() - firstRenderTime.current) / 1000)

    setAnswer({
      selectedAnswer: answer,
      isCorrect: null,
      timeToAnswer,
    })

    setTimeout(() => {
      setAnswer({
        selectedAnswer: answer,
        isCorrect: question!.answers[0] === answer,
        timeToAnswer,
      })

      setTimeout(() => {
        onSelectAnswer({
          answer,
          timeToAnswer,
        })
      }, CORRECT_TIME)
    }, SELECTED_TIME)
  }

  let answerState: AnswerState = ''

  if (answer.selectedAnswer && answer.isCorrect !== null) {
    answerState = answer.isCorrect ? 'correct' : 'wrong'
  } else if (answer.selectedAnswer) {
    answerState = 'answered'
  }

  return (
    <div className={classes.question}>
      <QuestionTimer key={timer} timeout={timer} onTimeout={answer.selectedAnswer === '' ? onSkipAnswer : null} mode={answerState} />
      <h2>{question?.text}</h2>
      <Answers
        answers={question?.answers ?? []}
        selectedAnswer={answer.selectedAnswer}
        answerState={answerState}
        onSelect={handleSelectAnswer}
      />
    </div>
  )
}

export default Question
