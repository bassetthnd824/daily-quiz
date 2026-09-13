import 'server-only'
import { userDao } from '@/dao/user.dao'
import { requireAuth, requireFirestore } from '@/firebase/server'
import { QuizUser, UserProfile } from '@/models/user-profile.model'
import { adminUserActionSchema, updateUserProfileSchema } from '@/schemas/user.schema'
import * as v from 'valibot'

export class UserProfileError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'UserProfileError'
    this.status = status
  }
}

const getUserProfile = async (userId: string): Promise<UserProfile | undefined> => {
  return userDao.getUser(userId)
}

const ensureUserProfile = async ({
  userId,
  displayName,
  photoURL,
}: {
  userId: string
  displayName: string
  photoURL: string
}): Promise<UserProfile | undefined> => {
  const db = requireFirestore()

  return db.runTransaction(async (transaction) => {
    const existing = await userDao.getUserInTransaction(transaction, userId)

    if (existing) {
      return existing
    }

    const userProfile: UserProfile = {
      nickname: '',
      displayName,
      photoURL,
      canSubmitQuestions: true,
      isAdmin: false,
    }

    userDao.createUserProfile(transaction, userId, userProfile)
    return userProfile
  })
}

const getQuizUser = async (userId: string): Promise<QuizUser | undefined> => {
  const [user, userProfile] = await Promise.all([requireAuth().getUser(userId), getUserProfile(userId)])

  if (!user || !userProfile) {
    return undefined
  }

  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    ...userProfile,
  }
}

const updateUserProfile = async (userId: string, body: unknown): Promise<QuizUser> => {
  const parsed = v.safeParse(updateUserProfileSchema, body)

  if (!parsed.success) {
    throw new UserProfileError(400, 'Invalid profile')
  }

  const existing = await userDao.getUser(userId)

  if (!existing) {
    throw new UserProfileError(404, 'Profile not found')
  }

  await userDao.updateUserProfile(userId, { nickname: parsed.output.nickname })

  const quizUser = await getQuizUser(userId)

  if (!quizUser) {
    throw new UserProfileError(500, 'Profile not found')
  }

  return quizUser
}

const AUTH_USER_NOT_FOUND = 'auth/user-not-found'
const AUTH_GET_USERS_LIMIT = 100

const isAuthUserNotFound = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === AUTH_USER_NOT_FOUND

const assertAdmin = (quizUser: QuizUser) => {
  if (!quizUser.isAdmin) {
    throw new UserProfileError(403, 'Not allowed to review user profiles')
  }
}

const assertNotSelf = (admin: QuizUser, targetId: string) => {
  if (admin.uid === targetId) {
    throw new UserProfileError(400, 'You cannot change your own account this way')
  }
}

const listQuizUsers = async (admin: QuizUser): Promise<QuizUser[]> => {
  assertAdmin(admin)

  const profiles = await userDao.listUsers()

  if (profiles.length === 0) {
    return []
  }

  const auth = requireAuth()
  const authUsers = []

  for (let index = 0; index < profiles.length; index += AUTH_GET_USERS_LIMIT) {
    const chunk = profiles.slice(index, index + AUTH_GET_USERS_LIMIT)
    const result = await auth.getUsers(chunk.map((profile) => ({ uid: profile.uid })))
    authUsers.push(...result.users)
  }

  const authByUid = new Map(authUsers.map((user) => [user.uid, user]))

  return profiles
    .flatMap((profile) => {
      const authUser = authByUid.get(profile.uid)

      if (!authUser || authUser.disabled) {
        return []
      }

      return [
        {
          uid: profile.uid,
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          phoneNumber: authUser.phoneNumber,
          nickname: profile.nickname,
          displayName: profile.displayName,
          photoURL: profile.photoURL,
          isAdmin: profile.isAdmin,
          canSubmitQuestions: profile.canSubmitQuestions,
        },
      ]
    })
    .sort((left, right) => left.displayName.localeCompare(right.displayName))
}

const reviewUser = async (admin: QuizUser, targetId: string, body: unknown): Promise<QuizUser> => {
  assertAdmin(admin)
  assertNotSelf(admin, targetId)

  if (!targetId) {
    throw new UserProfileError(400, 'Invalid user')
  }

  const parsed = v.safeParse(adminUserActionSchema, body)

  if (!parsed.success) {
    throw new UserProfileError(400, 'Invalid user action')
  }

  const existing = await userDao.getUser(targetId)

  if (!existing) {
    throw new UserProfileError(404, 'Profile not found')
  }

  if (parsed.output.action === 'grantAdmin') {
    if (existing.isAdmin) {
      throw new UserProfileError(409, 'User is already an admin')
    }

    await userDao.updateUserRoles(targetId, { isAdmin: true })
  } else if (parsed.output.action === 'revokeAdmin') {
    if (!existing.isAdmin) {
      throw new UserProfileError(409, 'User is not an admin')
    }

    await userDao.updateUserRoles(targetId, { isAdmin: false })
  } else {
    if (!existing.canSubmitQuestions) {
      throw new UserProfileError(409, 'User cannot submit questions')
    }

    await userDao.updateUserRoles(targetId, { canSubmitQuestions: false })
  }

  const quizUser = await getQuizUser(targetId)

  if (!quizUser) {
    throw new UserProfileError(500, 'Profile not found')
  }

  return quizUser
}

const deleteAndBanUser = async (admin: QuizUser, targetId: string): Promise<void> => {
  assertAdmin(admin)
  assertNotSelf(admin, targetId)

  if (!targetId) {
    throw new UserProfileError(400, 'Invalid user')
  }

  const existing = await userDao.getUser(targetId)

  if (!existing) {
    throw new UserProfileError(404, 'Profile not found')
  }

  try {
    await requireAuth().updateUser(targetId, { disabled: true })
  } catch (error) {
    if (!isAuthUserNotFound(error)) {
      throw error
    }
  }

  await userDao.deleteUser(targetId)
}

export const userService = {
  getUserProfile,
  ensureUserProfile,
  getQuizUser,
  updateUserProfile,
  listQuizUsers,
  reviewUser,
  deleteAndBanUser,
}
