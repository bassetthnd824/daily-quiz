'use client'

import Link from 'next/link'
import classes from './NavMenu.module.scss'
import { useAuth } from '@/context/user-context'

export type NavMenuProps = {
  usageClass: 'headerNav' | 'homepageNav'
}

export const NavMenu = ({ usageClass }: NavMenuProps) => {
  const auth = useAuth()

  return (
    <nav className={classes[usageClass]}>
      <ul className={classes.navMenu}>
        <li className={classes.navMenuItem}>
          <Link href="/todays-quiz">Today&#39;s Quiz</Link>
        </li>
        <li className={classes.navMenuItem}>
          <Link href="/previous-quiz">Previous Quizzes</Link>
        </li>
        {(auth?.currentUser?.isAdmin || auth?.currentUser?.canSubmitQuestions) && (
          <li className={classes.navMenuItem}>
            <Link href="/submit-question">Submit New Question for Quizzes</Link>
          </li>
        )}
        <li className={classes.navMenuItem}>
          <Link href="/leader-board">Leader Board</Link>
        </li>
        <li className={classes.navMenuItem}>
          <Link href="/user-profile">User Profile</Link>
        </li>
        {auth?.currentUser?.isAdmin && (
          <li className={classes.navMenuItem}>
            <Link href="/pending-questions">Review Pending Questions</Link>
          </li>
        )}
        {auth?.currentUser?.isAdmin && (
          <li className={classes.navMenuItem}>
            <Link href="/admin-user-profiles">Review User Profiles</Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
