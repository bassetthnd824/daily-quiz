import { getUserName } from '@/util/user';
import Link from 'next/link';
import classes from './HeaderComponent.module.scss';

const HeaderComponent = () => {
  const username = getUserName()

  return (
      <header className={classes.header}>
        <Link href="/home">Home</Link>
        <h1>Daily Quiz</h1>
        {username && <div>Hello, {username}!</div>}
      </header>
  )
}

export default HeaderComponent