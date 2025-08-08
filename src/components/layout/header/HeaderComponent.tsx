'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import classes from './HeaderComponent.module.scss'
import { HeaderMenu } from '@/components/layout/header-menu/HeaderMenu'
import { useAuth } from '@/context/user-context'

const HeaderComponent = () => {
  const router = useRouter()
  const { currentUser, logout } = useAuth()

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

  return (
    <header className={classes.header}>
      <div className={classes.headerWrapper}>
        <Link href="/" className={classes.left}>
          Home
        </Link>
        <h1>Daily Quiz</h1>
        <div className={classes.right}>
          <div>{currentUser ? `Hello, ${currentUser.displayName}!` : 'Welcome'}</div>
          {currentUser && (
            <button type="button" className="btn btn-link" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
      <HeaderMenu />
    </header>
  )
}

export default HeaderComponent
