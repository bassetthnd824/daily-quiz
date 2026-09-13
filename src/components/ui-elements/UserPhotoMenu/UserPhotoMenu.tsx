'use client'

import SidePanel from '@/components/layout/side-panel/SidePanel'
import navClasses from '@/components/nav-menu/NavMenu.module.scss'
import UserPhoto from '@/components/ui-elements/UserPhoto/UserPhoto'
import { useAuth } from '@/context/user-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import classes from './UserPhotoMenu.module.scss'

type UserPhotoMenuProps = {
  onClose: () => void
}

const UserPhotoMenu: React.FC<UserPhotoMenuProps> = ({ onClose }: UserPhotoMenuProps) => {
  const { currentUser, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      onClose()
      router.push('/sign-in')
    } catch {
      return
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <SidePanel side="right" titleId="account-menu-title" onClose={onClose}>
      <div className={classes.identity}>
        <UserPhoto photoURL={currentUser.photoURL} size={48} />
        <div className={classes.details}>
          <h2 id="account-menu-title" className={classes.name}>
            {currentUser.displayName}
          </h2>
          {currentUser.email && <p className={classes.email}>{currentUser.email}</p>}
        </div>
      </div>

      <nav className={navClasses.headerNav}>
        <ul className={navClasses.navMenu}>
          <li className={navClasses.navMenuItem}>
            <Link href="/user-profile" onClick={onClose}>
              User Profile
            </Link>
          </li>
          <li className={navClasses.navMenuItem}>
            <button type="button" className="btn-link" onClick={() => void handleLogout()}>
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </SidePanel>
  )
}

export default UserPhotoMenu
