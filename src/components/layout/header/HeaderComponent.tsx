'use client'

import Link from 'next/link'
import classes from './HeaderComponent.module.scss'
import { useAuth } from '@/context/user-context'
import UserPhotoMenu from '@/components/ui-elements/UserPhotoMenu/UserPhotoMenu'
import { useBackdrop } from '@/context/backdrop-context'
import { useEffect, useState } from 'react'
import { HeaderMenu } from '../header-menu/HeaderMenu'
import UserPhoto from '@/components/ui-elements/UserPhoto/UserPhoto'

const HeaderComponent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false)
  const { currentUser } = useAuth()
  const { isOpen, open, close } = useBackdrop()

  useEffect(() => {
    if (!isOpen) {
      setIsMenuOpen(false)
      setIsUserMenuOpen(false)
    }
  }, [isOpen])

  const onOpenMenu = () => {
    setIsMenuOpen(true)
    open()
  }

  const onCloseMenu = () => {
    setIsMenuOpen(false)
    close()
  }

  const onToggleUserMenu = () => {
    if (isUserMenuOpen) {
      close()
    } else {
      open()
    }

    setIsUserMenuOpen((isUserMenuOpen) => !isUserMenuOpen)
  }

  return (
    <>
      {isMenuOpen && currentUser && <HeaderMenu onClose={onCloseMenu} />}

      <header className={classes.header}>
        <div className={classes.headerWrapper}>
          <div className={classes.left}>
            <button type="button" className={classes.menuButton} aria-label="Menu" onClick={onOpenMenu}>
              <i className="fas fa-bars"></i>
            </button>
          </div>

          <h1>
            <Link href="/">Daily Quiz</Link>
          </h1>

          <div className={classes.right}>
            {currentUser && (
              <div onClick={onToggleUserMenu}>
                <UserPhoto photoURL={currentUser.photoURL} />
              </div>
            )}
            <div>{!currentUser && 'Welcome'}</div>
          </div>
        </div>
      </header>
      {currentUser && isUserMenuOpen && <UserPhotoMenu isOpen={isUserMenuOpen} open={onToggleUserMenu} close={onToggleUserMenu} />}
    </>
  )
}

export default HeaderComponent
