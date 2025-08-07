import { userService } from '@/bo/user.bo'
import { auth, SESSION_COOKIE } from '@/firebase/server'
import { QuizUser } from '@/models/user-profile.model'
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

    quizUser = await userService.getQuizUser(idToken?.uid)

    if (!quizUser) {
      return new NextResponse(undefined, { status: 404 })
    }

    return NextResponse.json(quizUser)
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
