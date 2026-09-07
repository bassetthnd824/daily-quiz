import { describe, expect, it } from 'vitest'
import { isTheme } from './theme-context'

describe('isTheme', () => {
  it('accepts known theme ids', () => {
    expect(isTheme('light')).toBe(true)
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('bama')).toBe(true)
    expect(isTheme('barn')).toBe(true)
  })

  it('rejects unknown values', () => {
    expect(isTheme('solarized')).toBe(false)
    expect(isTheme(null)).toBe(false)
  })
})
