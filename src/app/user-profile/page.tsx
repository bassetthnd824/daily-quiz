import { userService } from '@/bo/user.bo'
import { requirePageSession } from '@/util/require-session'
import { redirect } from 'next/navigation'
import UserProfileForm from './UserProfileForm'

const UserProfilePage = async () => {
  const uid = await requirePageSession()
  const user = await userService.getQuizUser(uid)

  if (!user) {
    redirect('/sign-in')
  }

  return <UserProfileForm user={user} />
}

export default UserProfilePage
