import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Answers from './Answers'

const answers = ['Paris', 'Lyon', 'Nice']

describe('Answers', () => {
  it('renders a button for each answer', () => {
    render(<Answers answers={answers} selectedAnswer="" answerState="" onSelect={vi.fn()} />)

    expect(screen.getAllByRole('button')).toHaveLength(3)
    for (const answer of answers) {
      expect(screen.getByRole('button', { name: answer })).toBeEnabled()
    }
  })

  it('notifies the parent when an answer is chosen', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<Answers answers={answers} selectedAnswer="" answerState="" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'Paris' }))
    expect(onSelect).toHaveBeenCalledWith('Paris')
  })

  it('disables buttons after an answer is selected', () => {
    render(<Answers answers={answers} selectedAnswer="Paris" answerState="answered" onSelect={vi.fn()} />)

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled()
    }
  })
})
