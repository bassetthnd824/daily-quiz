import { describe, expect, it, vi } from 'vitest'
import { daysBefore, isoDateToday, isWeekday, shuffle } from './quiz-utils.js'

describe('isoDateToday', () => {
  it('returns the local calendar date', () => {
    expect(isoDateToday(new Date(2026, 8, 14, 8, 30, 0))).toBe('2026-09-14')
  })
})

describe('isWeekday', () => {
  it('treats Monday through Friday as weekdays', () => {
    expect(isWeekday('2026-09-14')).toBe(true)
    expect(isWeekday('2026-09-18')).toBe(true)
  })

  it('treats Saturday and Sunday as the weekend', () => {
    expect(isWeekday('2026-09-12')).toBe(false)
    expect(isWeekday('2026-09-13')).toBe(false)
  })
})

describe('daysBefore', () => {
  it('subtracts days across month and year boundaries', () => {
    expect(daysBefore('2026-09-14', 30)).toBe('2026-08-15')
    expect(daysBefore('2026-01-15', 30)).toBe('2025-12-16')
  })
})

describe('shuffle', () => {
  it('keeps the same items', () => {
    const items = ['a', 'b', 'c', 'd']
    expect(shuffle(items).sort()).toEqual(items)
    expect(items).toEqual(['a', 'b', 'c', 'd'])
  })

  it('uses Fisher-Yates swaps', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.9).mockReturnValueOnce(0.1).mockReturnValueOnce(0.5)
    expect(shuffle(['a', 'b', 'c', 'd'])).toEqual(['c', 'b', 'a', 'd'])
  })
})
