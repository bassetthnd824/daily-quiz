'use client'

import { useEffect, useRef, useState } from 'react'
import classes from './Countdown.module.scss'

export type CountdownProps = {
  duration: number
  onComplete: () => void
}

const UPDATE_INTERVAL = 100

const Countdown = ({ duration, onComplete }: CountdownProps) => {
  const [remainingTime, setRemainingTime] = useState(duration)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const timer = setTimeout(() => {
      onCompleteRef.current()
    }, duration)

    return () => {
      clearTimeout(timer)
    }
  }, [duration])

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prevRemainingTime) => Math.max(0, prevRemainingTime - UPDATE_INTERVAL))
    }, UPDATE_INTERVAL)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const seconds = Math.max(1, Math.ceil(remainingTime / 1000))

  return (
    <div className={classes.countdown} role="timer" aria-live="polite" aria-atomic="true">
      <h2>Get ready</h2>
      <p className={classes.message}>The quiz starts in</p>
      <p className={classes.seconds}>{seconds}</p>
      <p className={classes.unit}>{seconds === 1 ? 'second' : 'seconds'}</p>
      <progress className={classes.progress} max={duration} value={remainingTime} />
    </div>
  )
}

export default Countdown
