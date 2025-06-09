import Link from "next/link";
import classes from './NavMenu.module.scss'

export type NavMenuProps = {
  usageClass: 'headerNav' | 'homepageNav';
}

export const NavMenu = ({ usageClass }: NavMenuProps) => {
  return (
    <nav className={classes[usageClass]}>
      <ul className={classes.navMenu}>
        <li className={classes.navMenuItem}><Link href="/todays-quiz">Today&#39;s Quiz</Link></li>
        <li className={classes.navMenuItem}><Link href="/previous-quiz">Previous Day&#39;s Quiz</Link></li>
        <li className={classes.navMenuItem}><Link href="/leader-board">Leader Board</Link></li>
      </ul>
    </nav>
  )
}
