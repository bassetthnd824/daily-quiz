export const formatFieldErrors = (errors: unknown[]): string =>
  errors
    .map((error) => {
      if (typeof error === 'string') {
        return error
      }

      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message
      }

      return undefined
    })
    .filter((message): message is string => Boolean(message))
    .join(', ')
