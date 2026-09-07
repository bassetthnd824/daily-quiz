import { describe, expect, it, vi } from 'vitest'
import { userDao } from '@/dao/user.dao'
import { requireAuth, requireFirestore } from '@/firebase/server'
import { quizUser } from '@/test/fixtures'
import { userService } from './user.bo'

vi.mock('@/dao/user.dao', () => ({
  userDao: {
    getUser: vi.fn(),
    getUserInTransaction: vi.fn(),
    createUserProfile: vi.fn(),
  },
}))

vi.mock('@/firebase/server', () => ({
  requireAuth: vi.fn(),
  requireFirestore: vi.fn(),
}))

describe('userService', () => {
  it('returns an existing profile', async () => {
    const profile = {
      nickname: 'Ada',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
      canSubmitQuestions: true,
      isAdmin: false,
    }
    vi.mocked(userDao.getUser).mockResolvedValue(profile)

    await expect(userService.getUserProfile('user-1')).resolves.toEqual(profile)
  })

  it('creates a profile when none exists', async () => {
    const runTransaction = vi.fn(async (fn: (transaction: object) => unknown) => fn({}))
    vi.mocked(requireFirestore).mockReturnValue({ runTransaction } as never)
    vi.mocked(userDao.getUserInTransaction).mockResolvedValue(undefined)

    const created = await userService.ensureUserProfile({
      userId: 'user-1',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
    })

    expect(created).toMatchObject({
      displayName: 'Ada Lovelace',
      canSubmitQuestions: true,
      isAdmin: false,
      nickname: '',
    })
    expect(userDao.createUserProfile).toHaveBeenCalledOnce()
  })

  it('returns an existing profile inside the transaction', async () => {
    const existing = {
      nickname: '',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
      canSubmitQuestions: true,
      isAdmin: false,
    }
    const runTransaction = vi.fn(async (fn: (transaction: object) => unknown) => fn({}))
    vi.mocked(requireFirestore).mockReturnValue({ runTransaction } as never)
    vi.mocked(userDao.getUserInTransaction).mockResolvedValue(existing)

    await expect(
      userService.ensureUserProfile({
        userId: 'user-1',
        displayName: 'Ada Lovelace',
        photoURL: 'https://example.com/ada.png',
      }),
    ).resolves.toEqual(existing)
    expect(userDao.createUserProfile).not.toHaveBeenCalled()
  })

  it('combines auth and profile records into a quiz user', async () => {
    vi.mocked(requireAuth).mockReturnValue({
      getUser: vi.fn().mockResolvedValue({
        uid: quizUser.uid,
        email: quizUser.email,
        emailVerified: true,
        phoneNumber: undefined,
      }),
    } as never)
    vi.mocked(userDao.getUser).mockResolvedValue({
      nickname: 'Ada',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
      canSubmitQuestions: true,
      isAdmin: false,
    })

    await expect(userService.getQuizUser(quizUser.uid)).resolves.toMatchObject({
      uid: quizUser.uid,
      email: quizUser.email,
      nickname: 'Ada',
      canSubmitQuestions: true,
    })
  })

  it('returns undefined when the profile is missing', async () => {
    vi.mocked(requireAuth).mockReturnValue({
      getUser: vi.fn().mockResolvedValue({ uid: quizUser.uid }),
    } as never)
    vi.mocked(userDao.getUser).mockResolvedValue(undefined)

    await expect(userService.getQuizUser(quizUser.uid)).resolves.toBeUndefined()
  })
})
