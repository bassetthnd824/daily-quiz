'use client'

import { CSRF_TOKEN_NAME } from '@/constants/constants'
import { getCookie } from '@/util/csrf-tokens'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

type FormInputs = {
  text: string
  correctAnswer: string
  answers: {
    value: string
  }[]
}

const SubmitQuestion = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      text: '',
      correctAnswer: '',
      answers: [{ value: '' }, { value: '' }, { value: '' }],
    },
  })

  const { fields: answerFields } = useFieldArray({
    control,
    name: 'answers',
  })

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true)
    const csrfTokenCookie = getCookie(CSRF_TOKEN_NAME)
    const question = {
      text: data.text,
      correctAnswer: data.correctAnswer,
      answers: data.answers.map((answer) => answer.value),
    }

    const response = await fetch('/api/question', {
      method: 'POST',
      headers: {
        [CSRF_TOKEN_NAME]: csrfTokenCookie ?? '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(question),
    })

    if (response.ok) {
      reset()
      setErrorMessage('')
      setIsSubmitting(false)
    } else {
      const error = await response.text()
      setErrorMessage(error)
      setIsSubmitting(false)
    }
  })

  return (
    <>
      {errorMessage && <div className="errorMsg">{errorMessage}</div>}

      <form onSubmit={onSubmit}>
        <label htmlFor="text">Question Text</label>
        <input {...register('text', { required: true })} id="text" />
        {errors.text && <span className="error-text">This field is required</span>}

        <label htmlFor="correctAnswer">Correct Answer</label>
        <input {...register('correctAnswer', { required: true })} id="correctAnswer" />
        {errors.text && <span className="error-text">This field is required</span>}

        {answerFields.map((answer, index) => (
          <div key={answer.id}>
            <label htmlFor={`answer-${index}`}>Wrong Answer {index + 1}</label>
            <input {...register(`answers.${index}.value`, { required: true })} id={`answer-${index}`} />
          </div>
        ))}

        <div className="btn-container">
          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </>
  )
}

export default SubmitQuestion
