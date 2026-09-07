import { quizService } from '@/bo/quiz.bo'
import { userService } from '@/bo/user.bo'
import { firestore } from '@/firebase/server'
import { withCsrf } from '@/util/csrf-tokens'
import { requireSession } from '@/util/require-session'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest, { params }: { params: Promise<{ date: string }> }) => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
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
    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    if (!firestore) {
      return new NextResponse('Internal Error: no firestore', { status: 500 })
    }

    const { date } = await params
    const userQuizEntry = await request.json()
    const quizUser = await userService.getQuizUser(session.uid)

    if (!quizUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    return NextResponse.json(await quizService.getQuizResults(date, quizUser, userQuizEntry))
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const PATCH = withCsrf(PATCH_handler)
