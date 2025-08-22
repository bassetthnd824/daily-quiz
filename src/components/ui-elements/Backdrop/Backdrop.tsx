import classes from './Backdrop.module.scss'

export type BackdropProps = {
  isOpen: boolean
  onClick: () => void
}

const Backdrop: React.FC<BackdropProps> = ({ isOpen, onClick }) => {
  if (!isOpen) {
    return null
  }

  return <div className={classes.backdrop} onClick={onClick}></div>
}

export default Backdrop
