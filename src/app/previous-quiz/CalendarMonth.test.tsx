import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CalendarMonth from './CalendarMonth'

const monthYear = { monthNdx: 8, month: 'Sep', year: 2026 }

describe('CalendarMonth', () => {
  it('renders the month heading and weekday labels', () => {
    render(
      <CalendarMonth
        monthYear={monthYear}
        completedDates={[]}
        nextDisabled={false}
        prevHref="/previous-quiz?month=2026-08"
        nextHref="/previous-quiz?month=2026-10"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Sep 2026' })).toBeInTheDocument()
    expect(screen.getAllByText('S')).toHaveLength(2)
  })

  it('links completed quiz days and disables next when requested', () => {
    render(
      <CalendarMonth
        monthYear={monthYear}
        completedDates={['2026-09-07']}
        nextDisabled
        prevHref="/previous-quiz?month=2026-08"
        nextHref="/previous-quiz?month=2026-10"
      />,
    )

    expect(screen.getByRole('link', { name: '7' })).toHaveAttribute('href', '/previous-quiz/2026-09-07')
    expect(screen.getByRole('button', { name: '>>' })).toBeDisabled()
  })
})
