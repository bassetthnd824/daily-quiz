import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { makeSummary } from '@/test/fixtures'
import Summary from './Summary'

describe('Summary', () => {
  it('renders a previous summary without submitting', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(
      <Summary
        date="2026-09-07"
        userAnswers={[]}
        prevSummary={makeSummary({
          score: 12,
          skippedAnswersShare: 10,
          correctAnswersShare: 70,
          wrongAnswersShare: 20,
          answers: [
            {
              questionId: 'q1',
              questionText: 'What is 2 + 2?',
              answer: '4',
              timeToAnswer: 1,
              status: 'correct',
              bonus: 10,
            },
          ],
        })}
      />,
    )

    expect(screen.getByText('Quiz Completed!')).toBeInTheDocument()
    expect(screen.getByText(/your score: 12/i)).toBeInTheDocument()
    expect(screen.getByText('Q: What is 2 + 2?')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
