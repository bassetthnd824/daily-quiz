import { userService } from '@/bo/user.bo'
import { auth, SESSION_COOKIE } from '@/firebase/server'
import { QuizUser } from '@/models/user-profile.model'
import { UserRecord } from 'firebase-admin/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async () => {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE)
    let quizUser: QuizUser | undefined = undefined

    if (!sessionCookie) {
      return new NextResponse(undefined, { status: 404 })
    }

    const idToken = await auth?.verifySessionCookie(sessionCookie.value, true)

    if (!idToken) {
      return new NextResponse(undefined, { status: 404 })
    }

    const user: UserRecord | undefined = await auth?.getUser(idToken?.uid)
    const userId = idToken.uid
    const userProfile = await userService.getUserProfile(userId)

    if (!user || !userProfile) {
      return new NextResponse(undefined, { status: 404 })
    }

    quizUser = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      ...userProfile,
    }

    return NextResponse.json(quizUser)
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
