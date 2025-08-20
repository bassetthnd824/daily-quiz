'use client'

import Link from 'next/link'
import classes from './HeaderComponent.module.scss'
import { HeaderMenu } from '@/components/layout/header-menu/HeaderMenu'
import { useAuth } from '@/context/user-context'
import UserPhotoMenu from '@/components/ui-elements/UserPhotoMenu/UserPhotoMenu'

const HeaderComponent = () => {
  const { currentUser } = useAuth()

  const openMenu = () => {}

  return (
    <header className={classes.header}>
      <div className={classes.headerWrapper}>
        <div className={classes.left}>
          <button type="button" className={classes.menuButton} aria-label="Menu" onClick={openMenu}>
            <i className="fas fa-bars"></i>
          </button>
        </div>

        <h1>
          <Link href="/">Daily Quiz</Link>
        </h1>

        <div className={classes.right}>
          {currentUser && <UserPhotoMenu />}
          <div>{!currentUser && 'Welcome'}</div>
        </div>
      </div>
      <HeaderMenu />
    </header>
  )
}

export default HeaderComponent
