import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Question from './Question'

const question = {
  id: 'q1',
  text: 'What is 2 + 2?',
  answers: ['4', '3', '5'],
}

describe('Question', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the prompt and answers', () => {
    render(<Question question={question} onSelectAnswer={vi.fn()} onSkipAnswer={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'What is 2 + 2?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument()
  })

  it('reports the selected answer after the hold time', async () => {
    const onSelectAnswer = vi.fn()
    render(<Question question={question} onSelectAnswer={onSelectAnswer} onSkipAnswer={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '4' }))
    expect(onSelectAnswer).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(3000)
    expect(onSelectAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ questionId: 'q1', answer: '4' }),
    )
  })
})
