'use client'

import { Question } from '@/models/question.model'
import classes from './Summary.module.scss'
import { UserAnswer } from '@/models/user-answer.model'
import { useEffect, useState } from 'react'
import { getCurrentDate } from '@/util/utility'
import { QuizSummary } from '@/models/quiz-summary.model'

export type SummaryProps = {
  userAnswers: UserAnswer[]
  questions: Question[]
  prevSummary?: QuizSummary
}

const Summary = ({ userAnswers, questions, prevSummary }: SummaryProps) => {
  const [loading, setLoading] = useState(true)
  const [quizSummary, setQuizSummary] = useState<QuizSummary>()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const patchQuiz = async () => {
      try {
        const quizPatchResponse = await fetch(`/api/quiz/${getCurrentDate()}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            userAnswers,
            questions,
          }),
        })
        const data = await quizPatchResponse.json()
        setQuizSummary(data)
      } catch (error) {
        setError(error as unknown as string)
      } finally {
        setLoading(false)
      }
    }

    if (!prevSummary) {
      patchQuiz()
    } else {
      setQuizSummary(prevSummary)
      setLoading(false)
    }
  }, [questions, userAnswers, prevSummary])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className={classes.summary}>
      <h2>Quiz Completed!</h2>
      <h3>Your Score: {quizSummary?.score}</h3>
      <div className={classes.summaryStats}>
        <p>
          <span className={classes.number}>{quizSummary?.skippedAnswersShare}%</span>
          <span className={classes.text}>skipped</span>
        </p>
        <p>
          <span className={classes.number}>{quizSummary?.correctAnswersShare}%</span>
          <span className={classes.text}>answered correctly</span>
        </p>
        <p>
          <span className={classes.number}>{quizSummary?.wrongAnswersShare}%</span>
          <span className={classes.text}>answered incorrectly</span>
        </p>
      </div>
      <div>
        {quizSummary?.answers.map((answer, index) => {
          return (
            <div className={classes.answerRow} key={index}>
              <div className={classes.answerNumber}>{index + 1}</div>
              <div className={classes.answerQuestion}>
                <p className={classes.question}>Q: {answer?.questionText}</p>
                <p className={`${classes.userAnswer} ${answer?.status ? classes[answer.status] : ''}`}>A: {answer.answer || 'Skipped'}</p>
                <p className={classes.question}>Score: {answer.bonus}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Summary
