import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import QuestionTimer from './QuestionTimer'

describe('QuestionTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onTimeout after the allotted time when running', async () => {
    const onTimeout = vi.fn()
    render(<QuestionTimer timeout={1000} running onTimeout={onTimeout} mode="" />)

    expect(screen.getByRole('progressbar')).toHaveValue(1000)
    await vi.advanceTimersByTimeAsync(1000)
    expect(onTimeout).toHaveBeenCalledOnce()
  })

  it('does not start when running is false', async () => {
    const onTimeout = vi.fn()
    render(<QuestionTimer timeout={1000} running={false} onTimeout={onTimeout} mode="" />)

    await vi.advanceTimersByTimeAsync(2000)
    expect(onTimeout).not.toHaveBeenCalled()
  })
})
