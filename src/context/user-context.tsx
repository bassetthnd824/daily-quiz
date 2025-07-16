'use client'

import { auth } from '@/firebase/client'
import { QuizUser, UserProfile } from '@/models/user-profile.model'
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

export type UserContextValue = {
  currentUser: QuizUser | null
  loginGoogle: () => Promise<void>
  logout: () => Promise<void>
}

export const UserContext = createContext<UserContextValue | null>(null)

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<QuizUser | null>(null)

  useEffect(() => {
    if (!auth) {
      return
    }

    return auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setCurrentUser(null)
      } else {
        let userProfile: UserProfile
        const userResponse = await fetch(`/api/users/${user.uid}`)

        if (userResponse.ok) {
          const userJson = await userResponse.json()
          if (userJson) {
            userProfile = {
              ...userJson,
            }

            setCurrentUser({
              ...user,
              ...userProfile,
            })
          } else {
            console.error('Could not get user profile')
          }
        } else {
          console.error('Could not get user profile')
        }
      }
    })
  }, [])

  const loginGoogle = () => {
    return new Promise<void>((resolve, reject) => {
      if (!auth) {
        reject()
        return
      }

      signInWithRedirect(auth, new GoogleAuthProvider())
        .then(() => {
          console.log('Signed In')
          resolve()
        })
        .catch(() => {
          console.error('Something went wrong')
          reject()
        })
    })
  }

  const logout = () => {
    return new Promise<void>((resolve, reject) => {
      if (!auth) {
        reject()
        return
      }

      auth
        .signOut()
        .then(() => {
          console.log('Signed out')
          resolve()
        })
        .catch(() => {
          console.error('Something went wrong')
          reject()
        })
    })
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
