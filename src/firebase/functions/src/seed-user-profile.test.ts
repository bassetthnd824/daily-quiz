import { describe, expect, it, vi } from 'vitest'

const { getFirestore } = vi.hoisted(() => ({
  getFirestore: vi.fn(),
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore,
}))

describe('seedUserProfile', () => {
  it('creates a default profile for a new auth user', async () => {
    const create = vi.fn()
    getFirestore.mockReturnValue({
      doc: vi.fn((path: string) => ({ path, create })),
    })
    const { seedUserProfile } = await import('./seed-user-profile.js')

    await seedUserProfile({
      uid: 'user-1',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
    })

    expect(create).toHaveBeenCalledWith({
      isAdmin: false,
      canSubmitQuestions: true,
      nickname: '',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
    })
  })

  it('stores empty name and photo when the auth user has none', async () => {
    const create = vi.fn()
    const doc = vi.fn(() => ({ create }))
    getFirestore.mockReturnValue({ doc })
    const { seedUserProfile } = await import('./seed-user-profile.js')

    await seedUserProfile({ uid: 'user-2' })

    expect(doc).toHaveBeenCalledWith('users/user-2')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: '',
        photoURL: '',
      }),
    )
  })
})
