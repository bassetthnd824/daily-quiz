import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UserContext } from '@/context/user-context'
import { adminUser, quizUser } from '@/test/fixtures'
import { NavMenu } from './NavMenu'

const renderMenu = (currentUser: typeof quizUser | null) =>
  render(
    <UserContext.Provider
      value={{
        currentUser,
        loginGoogle: async () => {},
        logout: async () => {},
      }}
    >
      <NavMenu usageClass="homepageNav" />
    </UserContext.Provider>,
  )

describe('NavMenu', () => {
  it('always shows the core quiz links', () => {
    renderMenu(null)
    expect(screen.getByRole('link', { name: /today's quiz/i })).toHaveAttribute('href', '/todays-quiz')
    expect(screen.getByRole('link', { name: /previous quizzes/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /leader board/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /submit new question/i })).not.toBeInTheDocument()
  })

  it('shows question submission for permitted users', () => {
    renderMenu(quizUser)
    expect(screen.getByRole('link', { name: /submit new question/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /review pending questions/i })).not.toBeInTheDocument()
  })

  it('shows admin links for admins', () => {
    renderMenu(adminUser)
    expect(screen.getByRole('link', { name: /review pending questions/i })).toHaveAttribute(
      'href',
      '/pending-questions',
    )
    expect(screen.getByRole('link', { name: /review user profiles/i })).toBeInTheDocument()
  })
})
