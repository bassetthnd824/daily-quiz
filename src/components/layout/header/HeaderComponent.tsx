import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import classes from './HeaderComponent.module.scss';
import { UserContext } from '@/context/user-context'
import { HeaderMenu } from "@/components/layout/header-menu/HeaderMenu";

const HeaderComponent = () => {
  const router = useRouter()
  const { sessionData, clearSessionData } = useContext(UserContext);

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: sessionData.username }),
    })

    if (response.ok) {
      clearSessionData();
      await router.push('/');
    } else {
      // Handle errors
    }
  }

  return (
      <header className={classes.header}>
        <div className={classes.headerWrapper}>
          <Link href="/" className={classes.left}>Home</Link>
          <h1>Daily Quiz</h1>
          <div className={classes.right}>
            <div>{sessionData?.username ? `Hello, ${sessionData.username}!` : 'Welcome'}</div>
            {sessionData?.username && <button type="button" className="btn-link" onClick={handleLogout}>Logout</button> }
          </div>
        </div>
        <HeaderMenu/>
      </header>
  )
}

export default HeaderComponent