import classes from '@/components/pages/todays-quiz/question/Question.module.scss'
import QuestionTimer from '@/components/pages/todays-quiz/question-timer/QuestionTimer'
import Answers from '@/components/pages/todays-quiz/answers/Answers'
import { AnswerState, QUESTION_TIME } from '@/components/pages/todays-quiz/quiz/Quiz'

export type QuestionProps = {
  questionText: string
  answers: string[]
  selectedAnswer: string
  answerState: AnswerState
  onSelectAnswer: (answer: string) => void
  onSkipAnswer: () => void
}

const Question = ({
  questionText,
  answers,
  selectedAnswer,
  answerState,
  onSelectAnswer,
  onSkipAnswer,
}: QuestionProps) => {
  return (
    <div className={classes.question}>
      <QuestionTimer timeout={QUESTION_TIME} onTimeout={onSkipAnswer} />
      <h2>{questionText}</h2>
      <Answers
        answers={answers}
        selectedAnswer={selectedAnswer}
        answerState={answerState}
        onSelect={onSelectAnswer}
      />
    </div>

  )
}

export default Question