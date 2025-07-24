import { Question } from '@/models/question.model'
import classes from './Summary.module.scss'
import { UserAnswer } from '@/models/user-answer.model'
import { QUESTION_TIME } from '../quiz/Quiz'

export type SummaryProps = {
  userAnswers: UserAnswer[]
  questions: Question[]
}

type DisplayAnswer = {
  answer: string
  cssClass: 'correct' | 'skipped' | 'wrong'
  bonus: number
}

const Summary = ({ userAnswers, questions }: SummaryProps) => {
  const skippedAnswers = userAnswers.filter((answer) => !answer.answer)
  const correctAnswers = userAnswers.filter((answer, index) => answer.answer === questions[index].answers[0])

  const skippedAnswersShare = Math.round((skippedAnswers.length / userAnswers.length) * 100)
  const correctAnswersShare = Math.round((correctAnswers.length / userAnswers.length) * 100)
  const wrongAnswersShare = 100 - skippedAnswersShare - correctAnswersShare

  const displayAnswers: DisplayAnswer[] = userAnswers.map((answer, index) => {
    let cssClass = ''

    if (!answer.answer) {
      cssClass += 'skipped'
    } else if (answer.answer === questions[index].answers[0]) {
      cssClass += 'correct'
    } else {
      cssClass += 'wrong'
    }

    const bonus = cssClass === 'correct' ? QUESTION_TIME / 1000 - answer.timeToAnswer : 0

    return {
      answer: answer.answer,
      cssClass,
      bonus,
    } as DisplayAnswer
  })

  const score = displayAnswers.reduce((accumulator, answer) => {
    return accumulator + (answer.cssClass === 'correct' ? answer.bonus : 0)
  }, 0)

  return (
    <div className={classes.summary}>
      <h2>Quiz Completed!</h2>
      <h3>Your Score: {score}</h3>
      <div className={classes.summaryStats}>
        <p>
          <span className={classes.number}>{skippedAnswersShare}%</span>
          <span className={classes.text}>skipped</span>
        </p>
        <p>
          <span className={classes.number}>{correctAnswersShare}%</span>
          <span className={classes.text}>answered correctly</span>
        </p>
        <p>
          <span className={classes.number}>{wrongAnswersShare}%</span>
          <span className={classes.text}>answered incorrectly</span>
        </p>
      </div>
      <div>
        {displayAnswers.map((answer, index) => {
          return (
            <div className={classes.answerRow} key={index}>
              <div className={classes.answerNumber}>{index + 1}</div>
              <div className={classes.answerQuestion}>
                <p className={classes.question}>Q: {questions[index].text}</p>
                <p className={`${classes.userAnswer} ${classes[answer.cssClass]}`}>A: {answer.answer || 'Skipped'}</p>
                <p className={classes.question}>Score: {answer.bonus}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Summary
