'use client'

import { createFormHook } from '@tanstack/react-form'
import { SubmitButton } from './SubmitButton'
import { TextField } from './TextField'
import { fieldContext, formContext } from './form-context'

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
  },
  formComponents: {
    SubmitButton,
  },
})
