'use client'

import classes from './Summary.module.scss'
import { SubmittedAnswer } from '@/models/user-answer.model'
import { Fragment, useEffect, useState } from 'react'
import { QuizSummary } from '@/models/quiz-summary.model'
import { csrfHeaders } from '@/util/get-cookie'

export type SummaryProps = {
  date: string
  userAnswers: SubmittedAnswer[]
  prevSummary?: QuizSummary
}

const Summary = ({ date, userAnswers, prevSummary }: SummaryProps) => {
  const [loading, setLoading] = useState(!prevSummary)
  const [quizSummary, setQuizSummary] = useState<QuizSummary | undefined>(prevSummary)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (prevSummary) {
      return
    }

    const submitQuiz = async () => {
      try {
        const quizPatchResponse = await fetch(`/api/quiz/${date}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...csrfHeaders(),
          },
          body: JSON.stringify({
            answers: userAnswers,
          }),
        })

        if (!quizPatchResponse.ok) {
          throw new Error('Failed to submit quiz')
        }

        const data = await quizPatchResponse.json()
        setQuizSummary(data)
      } catch (error) {
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    submitQuiz()
  }, [date, userAnswers, prevSummary])

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
      <div className={classes.answerGrid}>
        {quizSummary?.answers.map((answer, index) => (
          <Fragment key={answer.questionId ?? index}>
            <div className={classes.answerNumber}>
              <p>{index + 1}</p>
            </div>
            <div className={classes.answerQuestion}>
              <p className={classes.question}>Q: {answer?.questionText}</p>
              <p className={`${classes.userAnswer} ${answer?.status ? classes[answer.status] : ''}`}>A: {answer.answer || 'Skipped'}</p>
              <p className={classes.question}>Score: {answer.bonus}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default Summary
