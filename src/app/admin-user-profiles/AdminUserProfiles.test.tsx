import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { adminUser, quizUser } from '@/test/fixtures'
import AdminUserProfiles from './AdminUserProfiles'

describe('AdminUserProfiles', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows an empty state when there are no users', () => {
    render(<AdminUserProfiles users={[]} viewerId={adminUser.uid} />)

    expect(screen.getByText('No user profiles to review.')).toBeInTheDocument()
  })

  it('shows profile fields and hides actions on the current admin', () => {
    render(<AdminUserProfiles users={[adminUser, quizUser]} viewerId={adminUser.uid} />)

    expect(screen.getByText(`${adminUser.displayName} (you)`)).toBeInTheDocument()
    expect(screen.getByText('You cannot change your own account here.')).toBeInTheDocument()
    expect(screen.getByText(quizUser.displayName)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Grant admin' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revoke question submission' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete and ban' })).toBeInTheDocument()
  })

  it('grants admin after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const updated = { ...quizUser, isAdmin: true }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => updated,
      }),
    )

    render(<AdminUserProfiles users={[quizUser]} viewerId={adminUser.uid} />)

    await user.click(screen.getByRole('button', { name: 'Grant admin' }))

    expect(fetch).toHaveBeenCalledWith(
      `/api/users/${quizUser.uid}`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ action: 'grantAdmin' }),
      }),
    )
    expect(screen.getByRole('button', { name: 'Revoke admin' })).toBeInTheDocument()
  })

  it('does not call the API when confirmation is cancelled', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    vi.stubGlobal('fetch', vi.fn())

    render(<AdminUserProfiles users={[quizUser]} viewerId={adminUser.uid} />)

    await user.click(screen.getByRole('button', { name: 'Delete and ban' }))

    expect(fetch).not.toHaveBeenCalled()
  })

  it('deletes and bans a user after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '',
      }),
    )

    render(<AdminUserProfiles users={[quizUser]} viewerId={adminUser.uid} />)

    await user.click(screen.getByRole('button', { name: 'Delete and ban' }))

    expect(fetch).toHaveBeenCalledWith(
      `/api/users/${quizUser.uid}`,
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(screen.getByText('No user profiles to review.')).toBeInTheDocument()
  })
})
