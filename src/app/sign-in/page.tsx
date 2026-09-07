import { redirect } from 'next/navigation'
import { getSession } from '@/util/require-session'
import SignInButton from './SignInButton'
import classes from './page.module.scss'

const SignInComponent = async () => {
  const session = await getSession()

  if (session.ok) {
    redirect('/')
  }

  return (
    <div className={classes.pageWrapper}>
      <h2>Sign In</h2>
      <SignInButton />
    </div>
  )
}

export default SignInComponent
