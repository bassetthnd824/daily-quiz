'use client'

import { useAppForm } from '@/components/form/form'
import { requiredStringSchema } from '@/schemas/common.schema'
import { submitQuestionDefaultValues, submitQuestionSchema } from '@/schemas/question.schema'
import { csrfHeaders } from '@/util/get-cookie'
import { useState } from 'react'
import * as v from 'valibot'

const SubmitQuestionForm = () => {
  const [errorMessage, setErrorMessage] = useState('')

  const form = useAppForm({
    defaultValues: submitQuestionDefaultValues,
    onSubmit: async ({ value, formApi }) => {
      const question = v.parse(submitQuestionSchema, value)

      const response = await fetch('/api/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify(question),
      })

      if (response.ok) {
        formApi.reset()
        setErrorMessage('')
        return
      }

      setErrorMessage(await response.text())
    },
  })

  return (
    <>
      {errorMessage && <div className="errorMsg">{errorMessage}</div>}

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

          {submitQuestionDefaultValues.answers.map((_, index) => (
            <form.AppField key={index} name={`answers[${index}]`} validators={{ onChange: requiredStringSchema }}>
              {(field) => <field.TextField label={`Wrong Answer ${index + 1}`} />}
            </form.AppField>
          ))}

          <div className="btn-container">
            <form.SubmitButton label="Submit" />
          </div>
        </form>
      </form.AppForm>
    </>
  )
}

export default SubmitQuestionForm
