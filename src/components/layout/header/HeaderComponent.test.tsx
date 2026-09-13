import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BackdropContextProvider from '@/context/backdrop-context'
import { UserContext } from '@/context/user-context'
import { quizUser } from '@/test/fixtures'
import HeaderComponent from './HeaderComponent'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const renderHeader = (currentUser: typeof quizUser | null) =>
  render(
    <UserContext.Provider
      value={{
        currentUser,
        loginGoogle: async () => {},
        logout: async () => {},
        updateCurrentUser: () => {},
      }}
    >
      <BackdropContextProvider>
        <HeaderComponent />
      </BackdropContextProvider>
    </UserContext.Provider>,
  )

describe('HeaderComponent', () => {
  it('shows a welcome message when signed out', () => {
    renderHeader(null)
    expect(screen.getByRole('link', { name: 'Daily Quiz' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Welcome')).toBeInTheDocument()
  })

  it('opens the nav menu for a signed-in user', async () => {
    const user = userEvent.setup()
    renderHeader(quizUser)

    await user.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByRole('dialog', { name: 'Daily Quiz' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /today's quiz/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
  })

  it('opens the account menu for a signed-in user', async () => {
    const user = userEvent.setup()
    renderHeader(quizUser)

    await user.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(screen.getByRole('dialog', { name: quizUser.displayName })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /user profile/i })).toHaveAttribute('href', '/user-profile')
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
  })
})
