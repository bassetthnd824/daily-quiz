import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getCalendarDays,
  getCurrentDate,
  getCurrentMonthYear,
  getMonthDateRange,
  getMonthFromNdx,
  isWeekday,
  shiftMonthYear,
  shuffleArray,
  toIsoDate,
  yearMonthFromDate,
} from './utility'

describe('yearMonthFromDate', () => {
  it('returns the YYYY-MM prefix', () => {
    expect(yearMonthFromDate('2026-09-07')).toBe('2026-09')
  })
})

describe('isWeekday', () => {
  it('returns true for Monday through Friday', () => {
    expect(isWeekday('2026-09-07')).toBe(true)
    expect(isWeekday('2026-09-11')).toBe(true)
  })

  it('returns false for Saturday and Sunday', () => {
    expect(isWeekday('2026-09-05')).toBe(false)
    expect(isWeekday('2026-09-06')).toBe(false)
  })
})

describe('getMonthFromNdx', () => {
  it('maps month indexes to short names', () => {
    expect(getMonthFromNdx(0)).toBe('Jan')
    expect(getMonthFromNdx(8)).toBe('Sep')
    expect(getMonthFromNdx(11)).toBe('Dec')
  })
})

describe('getMonthDateRange', () => {
  it('returns the first and last day of a 31-day month', () => {
    expect(getMonthDateRange({ monthNdx: 8, month: 'Sep', year: 2026 })).toEqual({
      begDate: '2026-09-01',
      endDate: '2026-09-30',
    })
  })

  it('handles February in a leap year', () => {
    expect(getMonthDateRange({ monthNdx: 1, month: 'Feb', year: 2024 })).toEqual({
      begDate: '2024-02-01',
      endDate: '2024-02-29',
    })
  })
})

describe('shiftMonthYear', () => {
  it('shifts forward across a year boundary', () => {
    expect(shiftMonthYear({ monthNdx: 11, month: 'Dec', year: 2025 }, 1)).toEqual({
      monthNdx: 0,
      month: 'Jan',
      year: 2026,
    })
  })

  it('shifts backward', () => {
    expect(shiftMonthYear({ monthNdx: 8, month: 'Sep', year: 2026 }, -1)).toEqual({
      monthNdx: 7,
      month: 'Aug',
      year: 2026,
    })
  })
})

describe('toIsoDate', () => {
  it('zero-pads month and day', () => {
    expect(toIsoDate({ monthNdx: 0, month: 'Jan', year: 2026 }, 5)).toBe('2026-01-05')
  })
})

describe('getCalendarDays', () => {
  it('pads leading nulls so the 1st lands on the correct weekday', () => {
    const days = getCalendarDays({ monthNdx: 8, month: 'Sep', year: 2026 })
    expect(days[0]).toBe(null)
    expect(days[1]).toBe(null)
    expect(days[2]).toBe(1)
    const numbered = days.filter((day) => day !== null)
    expect(numbered).toHaveLength(30)
    expect(numbered.at(-1)).toBe(30)
  })
})

describe('shuffleArray', () => {
  it('does not mutate the original array', () => {
    const original = [1, 2, 3, 4]
    const copy = [...original]
    shuffleArray(original)
    expect(original).toEqual(copy)
  })

  it('returns the same elements', () => {
    const original = ['a', 'b', 'c']
    expect(shuffleArray(original).sort()).toEqual(['a', 'b', 'c'])
  })

  it('returns a new empty array for empty input', () => {
    const original: number[] = []
    const shuffled = shuffleArray(original)
    expect(shuffled).toEqual([])
    expect(shuffled).not.toBe(original)
  })
})

describe('getCurrentDate and getCurrentMonthYear', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 7, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the local calendar date', () => {
    expect(getCurrentDate()).toBe('2026-09-07')
  })

  it('returns the current month and year', () => {
    expect(getCurrentMonthYear()).toEqual({
      monthNdx: 8,
      month: 'Sep',
      year: 2026,
    })
  })
})
