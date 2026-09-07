import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useScreenWidth } from './use-screen-width'

const setWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width })
  window.dispatchEvent(new Event('resize'))
}

describe('useScreenWidth', () => {
  it('classifies mobile, tablet, and desktop widths', () => {
    setWidth(500)
    const { result } = renderHook(() => useScreenWidth())

    expect(result.current.isMobile()).toBe(true)
    expect(result.current.isTablet()).toBe(false)
    expect(result.current.isDesktop()).toBe(false)

    act(() => {
      setWidth(800)
    })
    expect(result.current.isTablet()).toBe(true)
    expect(result.current.isMobile()).toBe(false)

    act(() => {
      setWidth(1200)
    })
    expect(result.current.isDesktop()).toBe(true)
  })
})
