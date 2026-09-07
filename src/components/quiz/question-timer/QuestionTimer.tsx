import classes from './QuestionTimer.module.scss'
import { useEffect, useState } from 'react'
import { AnswerState } from '@/components/quiz/answer-state'

export type QuestionTimerProps = {
  timeout: number
  running: boolean
  onTimeout: () => void
  mode: AnswerState
}

const UPDATE_INTERVAL = 100

const QuestionTimer = ({ timeout, running, onTimeout, mode }: QuestionTimerProps) => {
  const [remainingTime, setRemainingTime] = useState(timeout)

  useEffect(() => {
    if (!running) {
      return
    }

    const timer = setTimeout(onTimeout, timeout)

    return () => {
      clearTimeout(timer)
    }
  }, [running, onTimeout, timeout])

  useEffect(() => {
    if (!running) {
      return
    }

    const interval = setInterval(() => {
      setRemainingTime((prevRemainingTime) => Math.max(0, prevRemainingTime - UPDATE_INTERVAL))
    }, UPDATE_INTERVAL)

    return () => {
      clearInterval(interval)
    }
  }, [running])

  return <progress className={`${classes.progress} ${mode}`} max={timeout} value={remainingTime} />
}

export default QuestionTimer
