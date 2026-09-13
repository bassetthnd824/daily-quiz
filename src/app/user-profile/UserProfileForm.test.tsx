import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ThemeContextProvider from '@/context/theme-context'
import { UserContext } from '@/context/user-context'
import { adminUser, quizUser } from '@/test/fixtures'
import { QuizUser } from '@/models/user-profile.model'
import UserProfileForm from './UserProfileForm'

const renderProfile = (user: QuizUser, updateCurrentUser = vi.fn()) =>
  render(
    <UserContext.Provider
      value={{
        currentUser: user,
        loginGoogle: async () => {},
        logout: async () => {},
        updateCurrentUser,
      }}
    >
      <ThemeContextProvider>
        <UserProfileForm user={user} />
      </ThemeContextProvider>
    </UserContext.Provider>,
  )

describe('UserProfileForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the profile photo and account fields', () => {
    renderProfile(quizUser)

    expect(screen.getByRole('img', { name: "User's profile photo" })).toHaveAttribute('src', quizUser.photoURL)
    expect(screen.getByText(quizUser.displayName)).toBeInTheDocument()
    expect(screen.getByText(quizUser.email as string)).toBeInTheDocument()
    expect(screen.getByLabelText('Nickname')).toHaveValue('Ada')
    expect(screen.getByText('Can submit questions')).toBeInTheDocument()
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
  })

  it('shows admin and submit roles', () => {
    renderProfile(adminUser)

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Can submit questions')).toBeInTheDocument()
  })

  it('saves a nickname and updates the current user', async () => {
    const user = userEvent.setup()
    const updateCurrentUser = vi.fn()
    const updated = { ...quizUser, nickname: 'Countess' }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => updated,
      }),
    )

    renderProfile(quizUser, updateCurrentUser)

    const nickname = screen.getByLabelText('Nickname')
    await user.clear(nickname)
    await user.type(nickname, 'Countess')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(fetch).toHaveBeenCalledWith(
      '/api/user',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ nickname: 'Countess' }),
      }),
    )
    expect(updateCurrentUser).toHaveBeenCalledWith(updated)
  })

  it('shows an error when saving fails', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        text: async () => 'Could not save',
      }),
    )

    renderProfile(quizUser)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Could not save')).toBeInTheDocument()
  })

  it('selects a single theme at a time', async () => {
    const user = userEvent.setup()
    renderProfile(quizUser)

    await user.click(screen.getByRole('radio', { name: 'Dark' }))

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Light' })).not.toBeChecked()
  })
})
