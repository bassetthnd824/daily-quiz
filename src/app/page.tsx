import { MAX_DAILY_QUESTIONS, MAX_POINTS, QUESTION_TIME, REUSE_QUESTION_AFTER_DAYS } from '@/constants/constants'
import classes from './page.module.scss'
import Link from 'next/link'

const HomeComponent = () => {
  const delaySeconds = QUESTION_TIME / 1000 / MAX_POINTS

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>Welcome to the Daily Quiz</h2>
      <p className={classes.paragraph}>
        Come here every weekday to test your knowledge. A new quiz is generated every weekday from our database of questions.{' '}
        {MAX_DAILY_QUESTIONS} questions are chosen randomly for the quiz and those question will not be used again for{' '}
        {REUSE_QUESTION_AFTER_DAYS} days.
      </p>
      <h3 className={classes.secondaryTitle}>The Rules</h3>
      <ul className={classes.ruleList}>
        <li>You will have {QUESTION_TIME / 1000} seconds to answer each question.</li>
        <li>A maximum of {MAX_POINTS} points can be scored for each correct answer.</li>
        <li>The faster you answer the more points you get.</li>
        <li>You lose one point for every {delaySeconds > 1 ? `${delaySeconds} seconds` : 'second'} it takes you to answer.</li>
      </ul>
      <p className={classes.paragraph}>
        Try it out{' '}
        <Link href="/todays-quiz" className={classes.link}>
          here
        </Link>
        !
      </p>
    </div>
  )
}

export default HomeComponent
