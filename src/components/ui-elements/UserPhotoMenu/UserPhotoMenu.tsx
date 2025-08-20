'use client'

import classes from './UserPhotoMenu.module.scss'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/user-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UserPhoto from '@/components/ui-elements/UserPhoto/UserPhoto'

type UserPhotoMenuProps = {
  isOpen: boolean
  open: () => void
  close: () => void
}

const UserPhotoMenu: React.FC<UserPhotoMenuProps> = ({ isOpen, open, close }: UserPhotoMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) {
      setIsMenuOpen(false)
    }
  }, [isOpen])

  const handleLogout = () => {
    logout()
      .then(() => {
        router.push('/sign-in')
        console.log('Logged out')
      })
      .catch(() => {
        console.log('Something went wrong')
      })
  }

  const toggleMenu = () => {
    if (isMenuOpen) {
      close()
    } else {
      open()
    }

    setIsMenuOpen((isMenuOpen) => !isMenuOpen)
  }

  return (
    <div className={classes.userMenu}>
      <div className={classes.dropdownMenu}>
        <h2 className={classes.userNamePhoto}>
          <div className={classes.userName}>{currentUser && currentUser.displayName}</div>
          <div className={classes.menuTrigger} onClick={toggleMenu}>
            {currentUser && <UserPhoto photoURL={currentUser.photoURL} size={40} />}
          </div>
        </h2>
        <p>{currentUser && currentUser.email}</p>
        <p>{currentUser && currentUser.phoneNumber}</p>
        <p>{currentUser && currentUser.nickname}</p>
        <p className="mt-16">{currentUser && <Link href="/user-profile">User Profile</Link>}</p>
        {currentUser && (
          <button className="btn btn-link" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  )
}

export default UserPhotoMenu
