import Image from 'next/image'
import classes from './UserPhoto.module.scss'

type UserPhotoProps = {
  photoURL: string
  size?: number
}

const UserPhoto: React.FC<UserPhotoProps> = ({ photoURL, size }: UserPhotoProps) => {
  const defaultSize = 40
  size = size ?? defaultSize

  return (
    <div className={classes.imageWrapper}>
      <Image src={photoURL} alt="User's profile photo" width={size} height={size} />
    </div>
  )
}

export default UserPhoto
