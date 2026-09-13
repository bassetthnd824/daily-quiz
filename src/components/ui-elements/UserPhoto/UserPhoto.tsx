import Image from 'next/image'
import { CSSProperties } from 'react'
import classes from './UserPhoto.module.scss'

type UserPhotoProps = {
  photoURL: string
  size?: number
}

const UserPhoto: React.FC<UserPhotoProps> = ({ photoURL, size = 40 }: UserPhotoProps) => {
  const style = { '--photo-size': `${size}px` } as CSSProperties

  if (!photoURL) {
    return (
      <div className={classes.imageWrapper} style={style} role="img" aria-label="User's profile photo">
        <span className={classes.placeholder} aria-hidden>
          <i className="fas fa-user"></i>
        </span>
      </div>
    )
  }

  return (
    <div className={classes.imageWrapper} style={style}>
      <Image src={photoURL} alt="User's profile photo" width={size} height={size} />
    </div>
  )
}

export default UserPhoto
