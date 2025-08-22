'use client'

import { LeaderboardEntry } from '@/models/leaderboard-entry.model'
import { useEffect, useState } from 'react'
import classes from './page.module.scss'
import UserPhoto from '@/components/ui-elements/UserPhoto/UserPhoto'

const LeaderBoard = () => {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    const getLeaderboard = async () => {
      const leaderboardResp = await fetch('/api/leaderboard')

      if (leaderboardResp.ok) {
        setLeaderboardEntries(await leaderboardResp.json())
      } else {
        setIsError(true)
      }

      setIsLoading(false)
    }

    getLeaderboard()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>There was an error getting the leader board.</div>
  }

  return (
    <ul className={classes.leaderBoard}>
      {leaderboardEntries &&
        leaderboardEntries.map((leaderboardEntry) => (
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
