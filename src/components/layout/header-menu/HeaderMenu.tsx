'use client'

import { NavMenu } from '@/components/nav-menu/NavMenu'
import { useAuth } from '@/context/user-context'
import Link from 'next/link'
import SidePanel from '../side-panel/SidePanel'
import panelClasses from '../side-panel/SidePanel.module.scss'

type HeaderMenuProps = {
  onClose: () => void
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({ onClose }: HeaderMenuProps) => {
  const { currentUser } = useAuth()

  return (
    <SidePanel side="left" titleId="nav-menu-title" onClose={onClose}>
      <h2 id="nav-menu-title" className={panelClasses.title}>
        <Link href="/" onClick={onClose}>
          Daily Quiz
        </Link>
      </h2>
      {currentUser && (
        <div onClick={onClose}>
          <NavMenu usageClass="headerNav" />
        </div>
      )}
    </SidePanel>
  )
}
