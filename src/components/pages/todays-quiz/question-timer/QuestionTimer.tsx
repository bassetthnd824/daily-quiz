import classes from './QuestionTimer.module.scss'
import { useEffect, useState } from 'react'
import { AnswerState } from '@/components/pages/todays-quiz/quiz/Quiz'

export type QuestionTimerProps = {
  timeout: number
  onTimeout: (() => void) | null
  mode: AnswerState
}

const UPDATE_INTERVAL = 100

const QuestionTimer = ({ timeout, onTimeout, mode }: QuestionTimerProps) => {
  const [remainingTime, setRemainingTime] = useState(timeout)

  useEffect(() => {
    const timer = setTimeout(onTimeout!, timeout)

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

  return <progress className={`${classes.progress} ${mode}`} max={timeout} value={remainingTime} />
}

export default QuestionTimer