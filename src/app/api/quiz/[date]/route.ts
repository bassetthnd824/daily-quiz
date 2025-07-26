import { quizService } from '@/bo/quiz.bo'
import { auth, firestore, SESSION_COOKIE } from '@/firebase/server'
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

export const PATCH = async (request: NextRequest, { params }: { params: Promise<{ date: string }> }) => {
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

    return NextResponse.json(await quizService.getQuizResults(date, uid, userQuizEntry))
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
