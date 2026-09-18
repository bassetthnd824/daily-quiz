import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UserContext } from '@/context/user-context'
import { quizUser } from '@/test/fixtures'
import { QuizUser } from '@/models/user-profile.model'
import HomePage from './HomePage'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

const renderHome = ({
  initiallySignedIn,
  currentUser = null,
}: {
  initiallySignedIn: boolean
  currentUser?: QuizUser | null
}) =>
  render(
    <UserContext.Provider
      value={{
        currentUser,
        loginGoogle: async () => {},
        logout: async () => {},
        updateCurrentUser: () => {},
      }}
    >
      <HomePage initiallySignedIn={initiallySignedIn} />
    </UserContext.Provider>,
  )

describe('HomePage', () => {
  it('links signed-in users to today\'s quiz', () => {
    renderHome({ initiallySignedIn: true })

    expect(screen.getByRole('heading', { name: 'Welcome to the Daily Quiz' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'here' })).toHaveAttribute('href', '/todays-quiz')
    expect(screen.queryByRole('button', { name: /sign in with google/i })).not.toBeInTheDocument()
  })

  it('prompts unsigned users to sign in', () => {
    renderHome({ initiallySignedIn: false })

    expect(screen.getByText("Sign in to take today's quiz.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'here' })).not.toBeInTheDocument()
  })

  it('switches to the quiz link after sign-in without a server refresh', () => {
    renderHome({ initiallySignedIn: false, currentUser: quizUser })

    expect(screen.getByRole('link', { name: 'here' })).toHaveAttribute('href', '/todays-quiz')
    expect(screen.queryByRole('button', { name: /sign in with google/i })).not.toBeInTheDocument()
  })
})
