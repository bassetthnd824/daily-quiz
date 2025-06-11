import classes from '@/components/quiz/question/Question.module.scss'
import QuestionTimer from '@/components/quiz/question-timer/QuestionTimer'
import Answers from '@/components/quiz/answers/Answers'
import {
  AnswerState,
  CORRECT_TIME,
  QUESTION_TIME,
  SELECTED_TIME,
} from '@/components/quiz/quiz/Quiz'
import { Question as QuestionModel } from '@/models/question.model'
import { useState } from 'react'

export type QuestionProps = {
  question?: QuestionModel,
  onSelectAnswer: (answer: string) => void
  onSkipAnswer: () => void
}

type Answer = {
  selectedAnswer: string
  isCorrect: boolean | null
}

const Question = ({
  question,
  onSelectAnswer,
  onSkipAnswer,
}: QuestionProps) => {
  const [answer, setAnswer] = useState<Answer>({
    selectedAnswer: '',
    isCorrect: null,
  })

  let timer = QUESTION_TIME

  if (answer.selectedAnswer) {
    timer = CORRECT_TIME
  }

  if (answer.isCorrect !== null) {
    timer = SELECTED_TIME
  }

  const handleSelectAnswer = (answer: string) => {
    console.log('set answer.  start timer.', answer)
    setAnswer({
      selectedAnswer: answer,
      isCorrect: null,
    })

    setTimeout(() => {
      console.log('set answer with isCorrect.')
      setAnswer({
        selectedAnswer: answer,
        isCorrect: question!.answers[0] === answer,
      })

      setTimeout(() => {
        console.log('pass the event upstairs.')
        onSelectAnswer(answer)
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
      <QuestionTimer
        key={timer}
        timeout={timer}
        onTimeout={answer.selectedAnswer === '' ? onSkipAnswer : null}
        mode={answerState}
      />
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