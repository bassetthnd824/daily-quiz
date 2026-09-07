'use client'

import { useFormContext } from './form-context'

type SubmitButtonProps = {
  label: string
  submittingLabel?: string
}

export const SubmitButton = ({ label, submittingLabel = 'Submitting...' }: SubmitButtonProps) => {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : label}
        </button>
      )}
    </form.Subscribe>
  )
}
