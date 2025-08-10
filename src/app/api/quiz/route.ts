export const dynamic = 'force-dynamic'

import { quizService } from '@/bo/quiz.bo'
import { firestore, SESSION_COOKIE } from '@/firebase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
  try {
    const cookieStore = await cookies()

    if (!cookieStore.has(SESSION_COOKIE)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    if (!firestore) {
      return new NextResponse('Internal Error: no firestore', { status: 500 })
    }

    const begDate = request.nextUrl.searchParams.get('begDate') ?? ''
    const endDate = request.nextUrl.searchParams.get('endDate') ?? ''

    if (begDate && endDate) {
      return NextResponse.json(await quizService.getQuizzes({ begDate, endDate }))
    } else {
      return NextResponse.json([])
    }
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
