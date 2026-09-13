import { userService } from '@/bo/user.bo'
import { requirePageSession } from '@/util/require-session'
import { redirect } from 'next/navigation'
import AdminUserProfiles from './AdminUserProfiles'

const AdminUserProfilesPage = async () => {
  const uid = await requirePageSession()
  const user = await userService.getQuizUser(uid)

  if (!user?.isAdmin) {
    redirect('/')
  }

  const users = await userService.listQuizUsers(user)

  return <AdminUserProfiles users={users} viewerId={user.uid} />
}

export default AdminUserProfilesPage
