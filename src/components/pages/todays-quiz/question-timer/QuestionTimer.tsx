import classes from './QuestionTimer.module.scss'
import { useEffect, useState } from 'react'

export type QuestionTimerProps = {
  timeout: number
  onTimeout: () => void
}

const UPDATE_INTERVAL = 100

const QuestionTimer = ({ timeout, onTimeout }: QuestionTimerProps) => {
  const [remainingTime, setRemainingTime] = useState(timeout)

  useEffect(() => {
    const timer = setTimeout(onTimeout, timeout)

    return () => {
      clearTimeout(timer)
    }
  }, [timeout, onTimeout])

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(prevRemainingTime => prevRemainingTime - UPDATE_INTERVAL)
    }, UPDATE_INTERVAL)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return <progress className={classes.progress} max={timeout} value={remainingTime}/>
}

export default QuestionTimer