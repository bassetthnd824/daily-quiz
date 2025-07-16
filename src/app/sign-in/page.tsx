'use client'

import { useRouter } from 'next/navigation'
import classes from './page.module.scss'
import { useAuth } from '@/context/user-context'

const SignInComponent = () => {
  const router = useRouter()
  const auth = useAuth()

  const handleLogin = () => {
    auth
      ?.loginGoogle()
      .then(() => {
        router.push('/')
        console.log('Logged In')
      })
      .catch(() => {
        console.log('Something went wrong')
      })
  }

  return (
    <>
      <h2>Sign In</h2>
      <div className={classes.buttonWrapper}>
        <button type="button" onClick={handleLogin}>
          Sign In With Google
        </button>
      </div>
    </>
  )
}

export default SignInComponent
