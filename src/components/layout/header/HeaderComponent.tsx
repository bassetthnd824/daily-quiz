'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import classes from './HeaderComponent.module.scss'
import { HeaderMenu } from '@/components/layout/header-menu/HeaderMenu'
import { useAuth } from '@/context/user-context'

const HeaderComponent = () => {
  const router = useRouter()
  const auth = useAuth()

  const handleLogout = () => {
    auth
      ?.logout()
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
          <div>{auth?.currentUser ? `Hello, ${auth.currentUser.displayName}!` : 'Welcome'}</div>
          {auth?.currentUser && (
            <button type="button" className="btn-link" onClick={handleLogout}>
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
