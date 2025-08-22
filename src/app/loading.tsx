import classes from './loading.module.scss'

const Loading = () => {
  return (
    <div className={classes.backdrop}>
      <div className={classes.loadingIndicatorWrapper}>
        <div className={classes.loadingIndicator}></div>
      </div>
    </div>
  )
}

export default Loading
