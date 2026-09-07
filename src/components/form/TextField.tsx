'use client'

import { formatFieldErrors } from './field-errors'
import { useFieldContext } from './form-context'

type TextFieldProps = {
  label: string
}

export const TextField = ({ label }: TextFieldProps) => {
  const field = useFieldContext<string>()
  const error = formatFieldErrors(field.state.meta.errors)
  const showError = !field.state.meta.isValid && error.length > 0

  return (
    <div>
      <label htmlFor={field.name}>{label}</label>
      <input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      />
      {showError && <span className="error-text">{error}</span>}
    </div>
  )
}
