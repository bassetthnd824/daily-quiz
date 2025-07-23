import classes from '@/components/quiz/answers/Answers.module.scss'
import { AnswerState } from '@/components/quiz/quiz/Quiz'
import { useRef } from 'react'

export type AnswersProps = {
  answers: string[]
  selectedAnswer: string
  answerState: AnswerState
  onSelect: (answer: string) => void
}

const Answers = ({ answers, selectedAnswer, answerState, onSelect }: AnswersProps) => {
  const shuffledAnswers = useRef<string[]>(undefined)

  if (!shuffledAnswers.current) {
    shuffledAnswers.current = [...answers]
    shuffledAnswers.current.sort(() => Math.random() - 0.5)
  }

  return (
    <ul className={classes.answers}>
      {shuffledAnswers.current.map((answer) => {
        const isSelected = selectedAnswer === answer
        let cssClass = ''

        if (isSelected) {
          cssClass = answerState
        }

        return (
          <li key={answer} className={classes.answer}>
            <button
              type="button"
              className={`btn ${cssClass ? classes[cssClass] : ''}`}
              onClick={() => onSelect(answer)}
              disabled={answerState !== ''}
            >
              {answer}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default Answers
