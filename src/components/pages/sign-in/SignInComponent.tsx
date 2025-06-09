import Head from "next/head";
import { useRouter } from 'next/router';
import { FormEvent, useContext } from 'react';
import { UserContext } from '@/context/user-context';
import classes from './SignIn.module.scss'

const SignInComponent = () => {
  const router = useRouter()
  const { setSessionData } = useContext(UserContext)

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const username = formData.has('username') ? formData.get('username') as string : ''

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })

    if (response.ok) {
      setSessionData({ username })
      await router.push('/home')
    } else {
      // Handle errors
    }
  }

  return (
    <>
      <Head>
        <title>Daily Quiz</title>
        <meta name="description" content="An app for a daily quiz" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <h2>Sign In</h2>
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="username">User Name</label>
        <input type="text" id="username" name="username" />
        <div className={classes.actions}>
          <button type="submit">Sign In</button>
        </div>
      </form>
    </>
  );
}

export default SignInComponent;