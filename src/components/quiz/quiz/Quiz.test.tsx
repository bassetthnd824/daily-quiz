import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeSummary } from '@/test/fixtures'
import Quiz from './Quiz'

const inProgressQuiz = {
  date: '2026-09-07',
  questions: [
    { id: 'q1', text: 'What is 2 + 2?', answers: ['4', '3'] },
    { id: 'q2', text: 'Capital of France?', answers: ['Paris', 'Lyon'] },
  ],
}

describe('Quiz', () => {
  it('shows the empty state when there are no questions or summary', () => {
    render(<Quiz quiz={{ date: '2026-09-07', questions: [] }} />)
    expect(screen.getByText(/there is no quiz for today/i)).toBeInTheDocument()
  })

  it('shows the first question when the quiz is in progress', () => {
    render(<Quiz quiz={inProgressQuiz} />)

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

  describe('when countdown is enabled', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('shows a countdown instead of the first question', () => {
      render(<Quiz quiz={inProgressQuiz} countdown />)

      expect(screen.getByRole('heading', { name: 'Get ready' })).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'What is 2 + 2?' })).not.toBeInTheDocument()
    })

    it('presents the first question after the countdown expires', async () => {
      render(<Quiz quiz={inProgressQuiz} countdown />)

      await vi.advanceTimersByTimeAsync(10000)

      expect(screen.queryByRole('heading', { name: 'Get ready' })).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'What is 2 + 2?' })).toBeInTheDocument()
    })

    it('skips the countdown when the quiz was already completed', () => {
      render(
        <Quiz
          quiz={{
            date: '2026-09-07',
            questions: [],
            summary: makeSummary({ score: 18 }),
          }}
          countdown
        />,
      )

      expect(screen.getByText('Quiz Completed!')).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Get ready' })).not.toBeInTheDocument()
    })

    it('skips the countdown when there is no quiz', () => {
      render(<Quiz quiz={{ date: '2026-09-07', questions: [] }} countdown />)

      expect(screen.getByText(/there is no quiz for today/i)).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Get ready' })).not.toBeInTheDocument()
    })
  })
})

