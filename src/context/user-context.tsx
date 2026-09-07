'use client'

import { auth } from '@/firebase/client'
import { QuizUser } from '@/models/user-profile.model'
import { csrfHeaders } from '@/util/get-cookie'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

export type UserContextValue = {
  currentUser: QuizUser | null
  loginGoogle: () => Promise<void>
  logout: () => Promise<void>
}

export const UserContext = createContext<UserContextValue>({
  currentUser: null,
  loginGoogle: async () => {},
  logout: async () => {},
})

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<QuizUser | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (sessionChecked) {
      return
    }

    const restoreSession = async () => {
      const response = await fetch('/api/auth/session')

      if (!response.ok) {
        if (window.location.pathname !== '/sign-in') {
          router.push('/sign-in')
        }

        setSessionChecked(true)
        return
      }

      const user: QuizUser = await response.json()
      setCurrentUser(user)
      setSessionChecked(true)
    }

    restoreSession()
  }, [router, sessionChecked])

  const loginGoogle = async () => {
    if (!auth) {
      throw new Error('Auth is not available')
    }

    const credential = await signInWithPopup(auth, new GoogleAuthProvider())
    const idToken = await credential.user.getIdToken()
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...csrfHeaders(),
      },
      body: JSON.stringify({ idToken }),
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    const user: QuizUser = await response.json()
    setCurrentUser(user)
    setSessionChecked(true)
  }

  const logout = async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: csrfHeaders(),
    })

    if (!response.ok) {
      throw new Error('Logout failed')
    }

    setCurrentUser(null)

    if (auth) {
      try {
        await auth.signOut()
      } catch {
        // in-memory Firebase auth may already be empty
      }
    }
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        loginGoogle,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider

export const useAuth = () => useContext(UserContext)
