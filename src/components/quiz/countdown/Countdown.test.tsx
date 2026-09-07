import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Countdown from './Countdown'

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the remaining seconds', () => {
    render(<Countdown duration={10000} onComplete={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Get ready' })).toBeInTheDocument()
    expect(screen.getByText('The quiz starts in')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('seconds')).toBeInTheDocument()
  })

  it('counts down each second', async () => {
    render(<Countdown duration={3000} onComplete={vi.fn()} />)

    expect(screen.getByText('3')).toBeInTheDocument()
    await vi.advanceTimersByTimeAsync(1000)
    expect(screen.getByText('2')).toBeInTheDocument()
    await vi.advanceTimersByTimeAsync(1000)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('second')).toBeInTheDocument()
  })

  it('calls onComplete when the duration elapses', async () => {
    const onComplete = vi.fn()
    render(<Countdown duration={2000} onComplete={onComplete} />)

    await vi.advanceTimersByTimeAsync(1999)
    expect(onComplete).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
