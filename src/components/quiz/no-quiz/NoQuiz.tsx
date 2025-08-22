import classes from './NoQuiz.module.scss'

const NoQuiz = () => {
  return (
    <div className={classes.noQuiz}>
      <p>I&apos;m sorry.</p>
      <p>There is no quiz for today. Come back tomorrow and test your knowledge again.</p>
    </div>
  )
}

export default NoQuiz
