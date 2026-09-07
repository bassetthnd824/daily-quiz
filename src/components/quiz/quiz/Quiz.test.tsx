import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeSummary } from '@/test/fixtures'
import Quiz from './Quiz'

describe('Quiz', () => {
  it('shows the empty state when there are no questions or summary', () => {
    render(<Quiz quiz={{ date: '2026-09-07', questions: [] }} />)
    expect(screen.getByText(/there is no quiz for today/i)).toBeInTheDocument()
  })

  it('shows the first question when the quiz is in progress', () => {
    render(
      <Quiz
        quiz={{
          date: '2026-09-07',
          questions: [
            { id: 'q1', text: 'What is 2 + 2?', answers: ['4', '3'] },
            { id: 'q2', text: 'Capital of France?', answers: ['Paris', 'Lyon'] },
          ],
        }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'What is 2 + 2?' })).toBeInTheDocument()
    expect(screen.queryByText('Quiz Completed!')).not.toBeInTheDocument()
  })

  it('shows the summary when the quiz was already completed', () => {
    render(
      <Quiz
        quiz={{
          date: '2026-09-07',
          questions: [],
          summary: makeSummary({ score: 18 }),
        }}
      />,
    )

    expect(screen.getByText('Quiz Completed!')).toBeInTheDocument()
    expect(screen.getByText(/your score: 18/i)).toBeInTheDocument()
  })
})
