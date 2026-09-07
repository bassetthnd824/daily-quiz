import { quizService, QuizSubmitError } from '@/bo/quiz.bo'
import { userService } from '@/bo/user.bo'
import { firestore } from '@/firebase/server'
import { withCsrf } from '@/util/csrf-tokens'
import { requireSession } from '@/util/require-session'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (_request: NextRequest, { params }: { params: Promise<{ date: string }> }) => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    if (!firestore) {
      return new NextResponse('Internal Error: no firestore', { status: 500 })
    }

    const { date } = await params
    const quiz = await quizService.getQuizView(date, session.uid)

    if (!quiz) {
      return new NextResponse('Quiz not found', { status: 404 })
    }

    return NextResponse.json(quiz)
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
    const quizUser = await userService.getQuizUser(session.uid)

    if (!quizUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body: unknown = await request.json()
    const answers = body && typeof body === 'object' && 'answers' in body ? (body as { answers: unknown }).answers : undefined

    return NextResponse.json(await quizService.submitAnswers(date, quizUser, answers))
  } catch (error) {
    if (error instanceof QuizSubmitError) {
      return new NextResponse(error.message, { status: error.status })
    }

    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const PATCH = withCsrf(PATCH_handler)
