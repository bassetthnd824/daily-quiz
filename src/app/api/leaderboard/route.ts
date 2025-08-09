import { quizService } from '@/bo/quiz.bo'
import { firestore, SESSION_COOKIE } from '@/firebase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async () => {
  try {
    const cookieStore = await cookies()

    if (!cookieStore.has(SESSION_COOKIE)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    if (!firestore) {
      return new NextResponse('Internal Error: no firestore', { status: 500 })
    }

    return NextResponse.json(await quizService.getLeaderboard())
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
