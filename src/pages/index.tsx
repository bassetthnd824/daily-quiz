import { setUserName } from '@/util/user';
import Head from "next/head";
import styles from "@/styles/SignIn.module.scss";
import { useRouter } from 'next/router';
import { useRef } from 'react';
import xss from 'xss';

const SignInComponent = () => {
  const userNameRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSignInClick = () => {
    setUserName(xss(userNameRef.current!.value))
    router.push('/home').then()
  }

  return (
    <>
      <Head>
        <title>Daily Quiz</title>
        <meta name="description" content="An app for a daily quiz" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div>
        <main className={styles.main}>
          <label htmlFor="username">User Name</label>
          <input type="text" id="username" ref={userNameRef}/>
          <button type="button" onClick={handleSignInClick}>Sign In</button>
        </main>
        <footer>
        </footer>
      </div>
    </>
  );
}

export default SignInComponent;