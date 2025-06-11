import { Question } from '@/models/question.model'
import classes from './Summary.module.scss'

export type SummaryProps = {
  userAnswers: string[],
  questions: Question[],
}

const Summary = ({ userAnswers, questions }: SummaryProps) => {
  console.log(userAnswers)
  const skippedAnswers = userAnswers.filter((answer) => answer === null);
  const correctAnswers = userAnswers.filter(
    (answer, index) => answer === questions[index].answers[0]
  );

  const skippedAnswersShare = Math.round(
    (skippedAnswers.length / userAnswers.length) * 100
  );

  const correctAnswersShare = Math.round(
    (correctAnswers.length / userAnswers.length) * 100
  );

  const wrongAnswersShare = 100 - skippedAnswersShare - correctAnswersShare;

  return (
    <div className={classes.summary}>
      <h2>Quiz Completed!</h2>
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
        {userAnswers.map((answer, index) => {
          let cssClass = '';

          if (!answer) {
            cssClass += 'skipped';
          } else if (answer === questions[index].answers[0]) {
            cssClass += 'correct';
          } else {
            cssClass += 'wrong';
          }

          return (
            <div className={classes.answerRow} key={index}>
              <div className={classes.answerNumber}>{index + 1}</div>
              <div className={classes.answerQuestion}>
                <p className={classes.question}>Q: {questions[index].text}</p>
                <p className={`${classes.userAnswer} ${classes[cssClass]}`}>A: {answer || 'Skipped'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Summary
