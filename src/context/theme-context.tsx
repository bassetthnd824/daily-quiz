'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

export const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'bama', label: 'Roll Moon Controlled Water Level' },
  { id: 'barn', label: 'War Bird of Prey / American Symbol of Freedom' },
] as const

export type Theme = (typeof THEMES)[number]['id']

export const isTheme = (value: string | null): value is Theme =>
  THEMES.some((theme) => theme.id === value)

type ThemeContextValue = {
  theme: Theme
  changeTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const initial = isTheme(stored)
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const changeTheme = (next: Theme) => {
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  return <ThemeContext.Provider value={{ theme, changeTheme }}>{children}</ThemeContext.Provider>
}

export default ThemeContextProvider

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeContextProvider')
  }

  return context
}
