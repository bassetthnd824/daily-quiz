import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UserContext } from '@/context/user-context'
import HomePage from './HomePage'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

const renderHome = (signedIn: boolean) =>
  render(
    <UserContext.Provider
      value={{
        currentUser: null,
        loginGoogle: async () => {},
        logout: async () => {},
        updateCurrentUser: () => {},
      }}
    >
      <HomePage signedIn={signedIn} />
    </UserContext.Provider>,
  )

describe('HomePage', () => {
  it('links signed-in users to today\'s quiz', () => {
    renderHome(true)

    expect(screen.getByRole('heading', { name: 'Welcome to the Daily Quiz' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'here' })).toHaveAttribute('href', '/todays-quiz')
    expect(screen.queryByRole('button', { name: /sign in with google/i })).not.toBeInTheDocument()
  })

  it('prompts unsigned users to sign in', () => {
    renderHome(false)

    expect(screen.getByText("Sign in to take today's quiz.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'here' })).not.toBeInTheDocument()
  })
})
