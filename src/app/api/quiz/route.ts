import { quizService } from '@/bo/quiz.bo'
import { firestore } from '@/firebase/server'
import { requireSession } from '@/util/require-session'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
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
