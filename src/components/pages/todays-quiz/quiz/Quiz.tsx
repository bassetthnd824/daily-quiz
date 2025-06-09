import { Question } from '@/models/question.model'
import { useCallback, useState } from 'react'
import classes from './Quiz.module.scss'
import QuestionComponent from '@/components/pages/todays-quiz/question/Question'

export type QuizProps = {
  questions: Question[]
}

export type AnswerState = '' | 'answered' | 'correct' | 'wrong'

export const QUESTION_TIME = 5000
export const SELECTED_TIME = 1000
export const CORRECT_TIME = 2000
export const WRONG_TIME = 2000

const Quiz = ({ questions }: QuizProps) => {
  const [answerState, setAnswerState] = useState<AnswerState>('')
  const [userAnswers, setUserAnswers] = useState<string[]>([])

  const activeQuestionIndex = answerState === '' ? userAnswers.length : userAnswers.length - 1
  const quizIsComplete = activeQuestionIndex === questions.length

  const handleSelectAnswer = useCallback((selectedAnswer: string) => {
    setAnswerState('answered')
    setUserAnswers((prevUserAnswers) => [...prevUserAnswers, selectedAnswer])

    setTimeout(() => {
      if (selectedAnswer === questions[activeQuestionIndex].answers[0]) {
        setAnswerState('correct')
      } else {
        setAnswerState('wrong')
      }

      setTimeout(() => setAnswerState(''), CORRECT_TIME)
    }, SELECTED_TIME)
  }, [activeQuestionIndex, questions])

  const handleSkipAnswer = useCallback(() => handleSelectAnswer(''), [handleSelectAnswer])

  if (quizIsComplete) {
    return (
      <div className={classes.summary}>
        <h2>Quiz Complete</h2>
      </div>
    )
  }

  return (
    <div className={classes.quiz}>
      <QuestionComponent
        key={activeQuestionIndex}
        questionText={questions.length > 0 ? questions[activeQuestionIndex].text : ''}
        answers={questions[activeQuestionIndex].answers}
        selectedAnswer={userAnswers[userAnswers.length - 1]}
        answerState={answerState}
        onSelectAnswer={handleSelectAnswer}
        onSkipAnswer={handleSkipAnswer}
      />
    </div>
  )
}

export default Quiz
