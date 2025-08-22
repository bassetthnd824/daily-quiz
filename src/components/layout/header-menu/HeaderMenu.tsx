'use client'

import { NavMenu } from '@/components/nav-menu/NavMenu'
import { useAuth } from '@/context/user-context'
import classes from './HeaderMenu.module.scss'

type HeaderMenuProps = {
  onClose: () => void
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({ onClose }: HeaderMenuProps) => {
  const { currentUser } = useAuth()

  return (
    <div className={classes.headerMenu}>
      <div className={classes.close} onClick={onClose}>
        <i className="fas fa-times"></i>
      </div>
      <div className={classes.logo}>
        <h2>Daily Quiz</h2>
      </div>
      {currentUser && (
        <div onClick={onClose}>
          <NavMenu usageClass="headerNav"></NavMenu>
        </div>
      )}
    </div>
  )
}
