import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NoQuiz from './NoQuiz'

describe('NoQuiz', () => {
  it('explains that there is no quiz today', () => {
    render(<NoQuiz />)
    expect(screen.getByText(/there is no quiz for today/i)).toBeInTheDocument()
  })
})
