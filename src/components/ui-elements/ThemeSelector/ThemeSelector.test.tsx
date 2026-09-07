import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ThemeContextProvider from '@/context/theme-context'
import ThemeSelector from './ThemeSelector'

describe('ThemeSelector', () => {
  it('lists every theme and updates localStorage', async () => {
    const user = userEvent.setup()
    render(
      <ThemeContextProvider>
        <ThemeSelector />
      </ThemeContextProvider>,
    )

    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: 'Dark' }))

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
