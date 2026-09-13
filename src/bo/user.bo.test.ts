import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userDao } from '@/dao/user.dao'
import { requireAuth, requireFirestore } from '@/firebase/server'
import { adminUser, quizUser } from '@/test/fixtures'
import { userService, UserProfileError } from './user.bo'

vi.mock('@/dao/user.dao', () => ({
  userDao: {
    getUser: vi.fn(),
    getUserInTransaction: vi.fn(),
    createUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
    listUsers: vi.fn(),
    updateUserRoles: vi.fn(),
    deleteUser: vi.fn(),
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
    vi.mocked(userDao.createUserProfile).mockReset()

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

  it('updates a nickname and returns the quiz user', async () => {
    const profile = {
      nickname: 'Ada',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
      canSubmitQuestions: true,
      isAdmin: false,
    }
    vi.mocked(userDao.getUser)
      .mockResolvedValueOnce(profile)
      .mockResolvedValueOnce({ ...profile, nickname: 'Newbie' })
    vi.mocked(userDao.updateUserProfile).mockResolvedValue(undefined)
    vi.mocked(requireAuth).mockReturnValue({
      getUser: vi.fn().mockResolvedValue({
        uid: quizUser.uid,
        email: quizUser.email,
        emailVerified: true,
        phoneNumber: undefined,
      }),
    } as never)

    await expect(userService.updateUserProfile(quizUser.uid, { nickname: 'Newbie' })).resolves.toMatchObject({
      uid: quizUser.uid,
      nickname: 'Newbie',
    })
    expect(userDao.updateUserProfile).toHaveBeenCalledWith(quizUser.uid, { nickname: 'Newbie' })
  })

  it('rejects an invalid nickname update', async () => {
    vi.mocked(userDao.updateUserProfile).mockReset()

    await expect(userService.updateUserProfile(quizUser.uid, { nickname: 'a'.repeat(41) })).rejects.toMatchObject({
      status: 400,
    })
    expect(userDao.updateUserProfile).not.toHaveBeenCalled()
  })

  it('rejects an update when the profile is missing', async () => {
    vi.mocked(userDao.updateUserProfile).mockReset()
    vi.mocked(userDao.getUser).mockResolvedValue(undefined)

    await expect(userService.updateUserProfile(quizUser.uid, { nickname: 'Ada' })).rejects.toMatchObject({
      status: 404,
    })
    expect(userDao.updateUserProfile).not.toHaveBeenCalled()
  })
})

describe('userService.listQuizUsers', () => {
  it('rejects non-admins', async () => {
    await expect(userService.listQuizUsers(quizUser)).rejects.toMatchObject({ status: 403 })
  })

  it('returns active users sorted by name and skips disabled accounts', async () => {
    vi.mocked(userDao.listUsers).mockResolvedValue([
      {
        uid: 'user-2',
        nickname: 'Grace',
        displayName: 'Grace Hopper',
        photoURL: 'https://example.com/grace.png',
        canSubmitQuestions: true,
        isAdmin: false,
      },
      {
        uid: quizUser.uid,
        nickname: 'Ada',
        displayName: 'Ada Lovelace',
        photoURL: 'https://example.com/ada.png',
        canSubmitQuestions: true,
        isAdmin: false,
      },
      {
        uid: 'banned-1',
        nickname: '',
        displayName: 'Banned',
        photoURL: '',
        canSubmitQuestions: true,
        isAdmin: false,
      },
    ])
    vi.mocked(requireAuth).mockReturnValue({
      getUsers: vi.fn().mockResolvedValue({
        users: [
          { uid: 'user-2', email: 'grace@example.com', emailVerified: true, phoneNumber: undefined, disabled: false },
          {
            uid: quizUser.uid,
            email: quizUser.email,
            emailVerified: true,
            phoneNumber: undefined,
            disabled: false,
          },
          { uid: 'banned-1', email: 'banned@example.com', emailVerified: true, phoneNumber: undefined, disabled: true },
        ],
        notFound: [],
      }),
    } as never)

    const users = await userService.listQuizUsers(adminUser)

    expect(users.map((user) => user.uid)).toEqual([quizUser.uid, 'user-2'])
    expect(users[0]?.displayName).toBe('Ada Lovelace')
  })
})

describe('userService.reviewUser', () => {
  beforeEach(() => {
    vi.mocked(userDao.getUser).mockReset()
    vi.mocked(userDao.updateUserRoles).mockReset()
  })

  it('rejects non-admins', async () => {
    await expect(userService.reviewUser(quizUser, 'user-2', { action: 'grantAdmin' })).rejects.toMatchObject({
      status: 403,
    })
  })

  it('rejects changes to the admin own account', async () => {
    await expect(userService.reviewUser(adminUser, adminUser.uid, { action: 'revokeAdmin' })).rejects.toMatchObject({
      status: 400,
    })
  })

  it('grants admin', async () => {
    const profile = {
      nickname: 'Ada',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
      canSubmitQuestions: true,
      isAdmin: false,
    }
    vi.mocked(userDao.getUser).mockResolvedValueOnce(profile).mockResolvedValueOnce({ ...profile, isAdmin: true })
    vi.mocked(requireAuth).mockReturnValue({
      getUser: vi.fn().mockResolvedValue({
        uid: quizUser.uid,
        email: quizUser.email,
        emailVerified: true,
        phoneNumber: undefined,
      }),
    } as never)

    await expect(userService.reviewUser(adminUser, quizUser.uid, { action: 'grantAdmin' })).resolves.toMatchObject({
      uid: quizUser.uid,
      isAdmin: true,
    })
    expect(userDao.updateUserRoles).toHaveBeenCalledWith(quizUser.uid, { isAdmin: true })
  })

  it('revokes question submission', async () => {
    const profile = {
      nickname: 'Ada',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
      canSubmitQuestions: true,
      isAdmin: false,
    }
    vi.mocked(userDao.getUser)
      .mockResolvedValueOnce(profile)
      .mockResolvedValueOnce({ ...profile, canSubmitQuestions: false })
    vi.mocked(requireAuth).mockReturnValue({
      getUser: vi.fn().mockResolvedValue({
        uid: quizUser.uid,
        email: quizUser.email,
        emailVerified: true,
        phoneNumber: undefined,
      }),
    } as never)

    await expect(
      userService.reviewUser(adminUser, quizUser.uid, { action: 'revokeSubmitQuestions' }),
    ).resolves.toMatchObject({
      canSubmitQuestions: false,
    })
    expect(userDao.updateUserRoles).toHaveBeenCalledWith(quizUser.uid, { canSubmitQuestions: false })
  })

  it('rejects granting admin when the user is already an admin', async () => {
    vi.mocked(userDao.getUser).mockResolvedValue({
      nickname: 'Ada',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
      canSubmitQuestions: true,
      isAdmin: true,
    })

    await expect(userService.reviewUser(adminUser, quizUser.uid, { action: 'grantAdmin' })).rejects.toMatchObject({
      status: 409,
    })
  })
})

describe('userService.deleteAndBanUser', () => {
  beforeEach(() => {
    vi.mocked(userDao.getUser).mockReset()
    vi.mocked(userDao.deleteUser).mockReset()
  })

  it('disables the auth user and deletes the profile', async () => {
    vi.mocked(userDao.getUser).mockResolvedValue({
      nickname: 'Ada',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
      canSubmitQuestions: true,
      isAdmin: false,
    })
    const updateUser = vi.fn().mockResolvedValue(undefined)
    vi.mocked(requireAuth).mockReturnValue({ updateUser } as never)

    await userService.deleteAndBanUser(adminUser, quizUser.uid)

    expect(updateUser).toHaveBeenCalledWith(quizUser.uid, { disabled: true })
    expect(userDao.deleteUser).toHaveBeenCalledWith(quizUser.uid)
  })

  it('deletes the profile when the auth user is already gone', async () => {
    vi.mocked(userDao.getUser).mockResolvedValue({
      nickname: 'Ada',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
      canSubmitQuestions: true,
      isAdmin: false,
    })
    vi.mocked(requireAuth).mockReturnValue({
      updateUser: vi.fn().mockRejectedValue({ code: 'auth/user-not-found' }),
    } as never)

    await userService.deleteAndBanUser(adminUser, quizUser.uid)

    expect(userDao.deleteUser).toHaveBeenCalledWith(quizUser.uid)
  })

  it('rejects deleting yourself', async () => {
    await expect(userService.deleteAndBanUser(adminUser, adminUser.uid)).rejects.toMatchObject({ status: 400 })
  })
})

describe('UserProfileError', () => {
  it('exposes a status code', () => {
    const error = new UserProfileError(400, 'Invalid profile')
    expect(error.status).toBe(400)
    expect(error.message).toBe('Invalid profile')
  })
})
