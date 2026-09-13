import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QuestionStatus } from '@/models/question-status.model'
import { makeQuestion } from '@/test/fixtures'
import PendingQuestionsReview from './PendingQuestionsReview'

const pendingQuestions = [
  makeQuestion({
    id: 'q1',
    text: 'What is 2 + 2?',
    answers: ['4', '3', '5', '22'],
    status: QuestionStatus.PENDING,
    submittedBy: 'Ada',
    dateSubmitted: '2026-09-01',
  }),
  makeQuestion({
    id: 'q2',
    text: 'Capital of France?',
    answers: ['Paris', 'Lyon', 'Nice'],
    status: QuestionStatus.PENDING,
    submittedBy: 'Grace',
    dateSubmitted: '2026-09-02',
  }),
]

describe('PendingQuestionsReview', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows an empty state when there are no pending questions', () => {
    render(<PendingQuestionsReview questions={[]} />)

    expect(screen.getByText('No pending questions to review.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  })

  it('shows the first pending question and its answers', () => {
    render(<PendingQuestionsReview questions={pendingQuestions} />)

    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Submitted by Ada on 2026-09-01')).toBeInTheDocument()
    expect(screen.getByLabelText('Question Text')).toHaveValue('What is 2 + 2?')
    expect(screen.getByLabelText('Correct Answer')).toHaveValue('4')
    expect(screen.getByLabelText('Wrong Answer 1')).toHaveValue('3')
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
  })

  it('moves to the next and previous questions', async () => {
    const user = userEvent.setup()
    render(<PendingQuestionsReview questions={pendingQuestions} />)

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Question Text')).toHaveValue('Capital of France?')
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Previous' }))

    expect(screen.getByLabelText('Question Text')).toHaveValue('What is 2 + 2?')
  })

  it('approves the current question with edits and shows the next one', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '',
      }),
    )

    render(<PendingQuestionsReview questions={pendingQuestions} />)

    const questionText = screen.getByLabelText('Question Text')
    await user.clear(questionText)
    await user.type(questionText, 'What is two plus two?')
    await user.click(screen.getByRole('button', { name: 'Approve' }))

    expect(fetch).toHaveBeenCalledWith(
      '/api/question/q1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          action: 'approve',
          text: 'What is two plus two?',
          correctAnswer: '4',
          answers: ['3', '5', '22'],
        }),
      }),
    )
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Question Text')).toHaveValue('Capital of France?')
  })

  it('rejects the current question and shows the next one', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '',
      }),
    )

    render(<PendingQuestionsReview questions={pendingQuestions} />)

    await user.click(screen.getByRole('button', { name: 'Reject' }))

    expect(fetch).toHaveBeenCalledWith(
      '/api/question/q1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ action: 'reject' }),
      }),
    )
    expect(screen.getByLabelText('Question Text')).toHaveValue('Capital of France?')
  })

  it('shows an error when the review request fails', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        text: async () => 'Not allowed to review questions',
      }),
    )

    render(<PendingQuestionsReview questions={pendingQuestions} />)

    await user.click(screen.getByRole('button', { name: 'Reject' }))

    expect(await screen.findByText('Not allowed to review questions')).toBeInTheDocument()
    expect(screen.getByLabelText('Question Text')).toHaveValue('What is 2 + 2?')
  })
})
