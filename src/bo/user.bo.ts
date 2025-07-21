import { userDao } from '@/dao/user.dao'
import { UserProfile } from '@/models/user-profile.model'

const getUserProfile = async (userId: string): Promise<UserProfile> => {
  let userProfile = await userDao.getUser(userId)

  if (!userProfile) {
    userProfile = {
      nickname: '',
      canSubmitQuestions: true,
      isAdmin: false,
    }
    await userDao.createUserProfile(userId, userProfile)
  }

  return userProfile
}

export const userService = {
  getUserProfile,
}
