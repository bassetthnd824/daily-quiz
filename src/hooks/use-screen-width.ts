import { useState, useEffect } from 'react'

const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
}

export type UseScreenWidthProps = {
  screenWidth: number
  isMobile: () => boolean
  isTablet: () => boolean
  isDesktop: () => boolean
}

export const useScreenWidth = () => {
  const [screenWidth, setScreenWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth
    }
    return 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const isMobile = () => screenWidth < breakpoints.md
  const isTablet = () => screenWidth >= breakpoints.md && screenWidth < breakpoints.lg
  const isDesktop = () => screenWidth >= breakpoints.lg

  return {
    screenWidth,
    isMobile,
    isTablet,
    isDesktop,
  }
}
