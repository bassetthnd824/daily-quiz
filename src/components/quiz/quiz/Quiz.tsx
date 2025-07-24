import { Question } from '@/models/question.model'
import { useCallback, useState } from 'react'
import classes from './Quiz.module.scss'
import QuestionComponent from '@/components/quiz/question/Question'
import Summary from '@/components/quiz/summary/Summary'
import { UserAnswer } from '@/models/user-answer.model'

export type QuizProps = {
  questions: Question[]
}

export type AnswerState = '' | 'answered' | 'correct' | 'wrong'

export const QUESTION_TIME = 10000
export const SELECTED_TIME = 1000
export const CORRECT_TIME = 2000

const Quiz = ({ questions }: QuizProps) => {
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])

  const activeQuestionIndex = userAnswers.length
  const quizIsComplete = activeQuestionIndex === questions.length

  const handleSelectAnswer = useCallback((selectedAnswer: UserAnswer) => {
    setUserAnswers((prevUserAnswers) => {
      return [...prevUserAnswers, selectedAnswer]
    })
  }, [])

  const handleSkipAnswer = useCallback(() => handleSelectAnswer({ answer: '', timeToAnswer: 0 }), [handleSelectAnswer])

  if (quizIsComplete) {
    return <Summary userAnswers={userAnswers} questions={questions} />
  }

  return (
    <div className={classes.quiz}>
      <QuestionComponent
        key={activeQuestionIndex}
        question={questions.length > 0 ? questions[activeQuestionIndex] : undefined}
        onSelectAnswer={handleSelectAnswer}
        onSkipAnswer={handleSkipAnswer}
      />
    </div>
  )
}

export default Quiz
