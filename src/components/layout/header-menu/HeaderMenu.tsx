'use client'

import { NavMenu } from '@/components/nav-menu/NavMenu'
import { useAuth } from '@/context/user-context'

export const HeaderMenu = () => {
  const auth = useAuth()

  return <>{auth?.currentUser && <NavMenu usageClass="headerNav"></NavMenu>}</>
}
