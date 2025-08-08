'use client'

import { NavMenu } from '@/components/nav-menu/NavMenu'
import { useAuth } from '@/context/user-context'

export const HeaderMenu = () => {
  const { currentUser } = useAuth()

  return <>{currentUser && <NavMenu usageClass="headerNav"></NavMenu>}</>
}
