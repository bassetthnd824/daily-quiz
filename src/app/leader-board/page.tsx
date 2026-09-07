import { quizService } from '@/bo/quiz.bo'
import UserPhoto from '@/components/ui-elements/UserPhoto/UserPhoto'
import { requirePageSession } from '@/util/require-session'
import classes from './page.module.scss'

const LeaderBoard = async () => {
  await requirePageSession()
  const leaderboardEntries = await quizService.getLeaderboard()

  return (
    <ul className={classes.leaderBoard}>
      {leaderboardEntries.map((leaderboardEntry) => (
        <li key={leaderboardEntry.userId}>
          <UserPhoto photoURL={leaderboardEntry.photoURL} />
          <div className={classes.displayName}>{leaderboardEntry.displayName}</div>
          <div className={classes.totalScore}>{leaderboardEntry.totalScore}</div>
        </li>
      ))}
    </ul>
  )
}

export default LeaderBoard
