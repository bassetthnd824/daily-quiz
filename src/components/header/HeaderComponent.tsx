import { clearUserName, getUserName } from '@/util/user';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import classes from './HeaderComponent.module.scss';

const HeaderComponent = () => {
  const usernameRef = useRef('')
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      usernameRef.current = getUserName()!
    }
  }, [])

  const handleLogout = async () => {
    clearUserName()
    await router.push('/')
  }

  return (
      <header className={classes.header}>
        <Link href="/home" className={classes.left}>Home</Link>
        <h1>Daily Quiz</h1>
        <div className={classes.right}>
          <div>{usernameRef.current ? `Hello, ${usernameRef.current}!` : 'Welcome'}</div>
          {usernameRef.current && <button type="button" className="btn-link" onClick={handleLogout}>Logout</button> }
        </div>
      </header>
  )
}

export default HeaderComponent