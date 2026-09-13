'use client'

import { useAppForm } from '@/components/form/form'
import { Question } from '@/models/question.model'
import { requiredStringSchema } from '@/schemas/common.schema'
import { questionToFormValues, submitQuestionSchema } from '@/schemas/question.schema'
import { csrfHeaders } from '@/util/get-cookie'
import { useState } from 'react'
import * as v from 'valibot'
import classes from './page.module.scss'

type PendingQuestionsReviewProps = {
  questions: Question[]
}

const ReviewQuestionForm = ({
  question,
  onReviewed,
}: {
  question: Question
  onReviewed: (questionId: string) => void
}) => {
  const [errorMessage, setErrorMessage] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  const form = useAppForm({
    defaultValues: questionToFormValues(question),
    onSubmit: async ({ value }) => {
      const payload = v.parse(submitQuestionSchema, value)

      const response = await fetch(`/api/question/${question.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({ action: 'approve', ...payload }),
      })

      if (response.ok) {
        setErrorMessage('')
        onReviewed(question.id)
        return
      }

      setErrorMessage(await response.text())
    },
  })

  const rejectQuestion = async () => {
    setIsRejecting(true)

    try {
      const response = await fetch(`/api/question/${question.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({ action: 'reject' }),
      })

      if (response.ok) {
        setErrorMessage('')
        onReviewed(question.id)
        return
      }

      setErrorMessage(await response.text())
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <>
      {errorMessage && <div className={classes.errorMsg}>{errorMessage}</div>}

      <form.AppForm>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.AppField name="text" validators={{ onChange: requiredStringSchema }}>
            {(field) => <field.TextField label="Question Text" />}
          </form.AppField>

          <form.AppField name="correctAnswer" validators={{ onChange: requiredStringSchema }}>
            {(field) => <field.TextField label="Correct Answer" />}
          </form.AppField>

          {questionToFormValues(question).answers.map((_, index) => (
            <form.AppField key={index} name={`answers[${index}]`} validators={{ onChange: requiredStringSchema }}>
              {(field) => <field.TextField label={`Wrong Answer ${index + 1}`} />}
            </form.AppField>
          ))}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <div className={classes.actions}>
                <button
                  type="button"
                  className={classes.reject}
                  disabled={isSubmitting || isRejecting}
                  onClick={() => void rejectQuestion()}
                >
                  {isRejecting ? 'Rejecting...' : 'Reject'}
                </button>
                <form.SubmitButton label="Approve" submittingLabel="Approving..." />
              </div>
            )}
          </form.Subscribe>
        </form>
      </form.AppForm>
    </>
  )
}

const PendingQuestionsReview = ({ questions: initialQuestions }: PendingQuestionsReviewProps) => {
  const [questions, setQuestions] = useState(initialQuestions)
  const [index, setIndex] = useState(0)

  const current = questions[index]

  const handleReviewed = (questionId: string) => {
    const remaining = questions.filter((question) => question.id !== questionId)
    setQuestions(remaining)
    setIndex(Math.min(index, Math.max(remaining.length - 1, 0)))
  }

  return (
    <div className={classes.review}>
      <h2>Review Pending Questions</h2>

      {current ? (
        <>
          <div className={classes.nav}>
            <button type="button" className="btn" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
              Previous
            </button>
            <p className={classes.position}>
              Question {index + 1} of {questions.length}
            </p>
            <button
              type="button"
              className="btn"
              disabled={index === questions.length - 1}
              onClick={() => setIndex((value) => value + 1)}
            >
              Next
            </button>
          </div>

          <p className={classes.meta}>
            Submitted by {current.submittedBy} on {current.dateSubmitted}
          </p>

          <ReviewQuestionForm key={current.id} question={current} onReviewed={handleReviewed} />
        </>
      ) : (
        <p>No pending questions to review.</p>
      )}
    </div>
  )
}

export default PendingQuestionsReview
