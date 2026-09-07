'use client'

import { createContext, ReactNode, useContext, useEffect, useSyncExternalStore } from 'react'

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

const THEME_CHANGE_EVENT = 'daily-quiz-theme'

const readTheme = (): Theme => {
  const stored = localStorage.getItem('theme')
  if (isTheme(stored)) {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const subscribeToTheme = (onStoreChange: () => void) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const onStorage = (event: StorageEvent) => {
    if (event.key === 'theme') {
      onStoreChange()
    }
  }

  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange)
  window.addEventListener('storage', onStorage)
  mediaQuery.addEventListener('change', onStoreChange)

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange)
    window.removeEventListener('storage', onStorage)
    mediaQuery.removeEventListener('change', onStoreChange)
  }
}

const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const theme = useSyncExternalStore<Theme>(subscribeToTheme, readTheme, (): Theme => 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const changeTheme = (next: Theme) => {
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
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
