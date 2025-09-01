import { quizService } from '@/bo/quiz.bo'
import { userService } from '@/bo/user.bo'
import { auth, firestore, SESSION_COOKIE } from '@/firebase/server'
import { withCsrf } from '@/util/csrf-tokens'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest, { params }: { params: Promise<{ date: string }> }) => {
  try {
    const cookieStore = await cookies()

    if (!cookieStore.has(SESSION_COOKIE)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    if (!firestore) {
      return new NextResponse('Internal Error: no firestore', { status: 500 })
    }

    const { date } = await params
    return NextResponse.json(await quizService.getQuizForDate(date))
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

const PATCH_handler = async (request: NextRequest, { params }: { params: Promise<{ date: string }> }) => {
  try {
    const cookieStore = await cookies()

    if (!cookieStore.has(SESSION_COOKIE)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    if (!firestore || !auth) {
      return new NextResponse('Internal Error: no firestore or no auth', { status: 500 })
    }

    const { date } = await params
    const sessionCookie = cookieStore.get(SESSION_COOKIE)

    if (!sessionCookie) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { uid } = await auth.verifySessionCookie(sessionCookie.value, true)
    const userQuizEntry = await request.json()
    const quizUser = await userService.getQuizUser(uid)

    return NextResponse.json(await quizService.getQuizResults(date, quizUser!, userQuizEntry))
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const PATCH = withCsrf(PATCH_handler)
