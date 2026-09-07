import { quizService, QuizSubmitError } from '@/bo/quiz.bo'
import { userService } from '@/bo/user.bo'
import { isoDateSchema } from '@/schemas/common.schema'
import { withCsrf } from '@/util/csrf'
import { requireSession } from '@/util/require-session'
import { NextRequest, NextResponse } from 'next/server'
import * as v from 'valibot'

export const GET = async (_request: NextRequest, { params }: { params: Promise<{ date: string }> }) => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    const { date } = await params

    if (!v.is(isoDateSchema, date)) {
      return new NextResponse('Invalid date', { status: 400 })
    }

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

    const { date } = await params

    if (!v.is(isoDateSchema, date)) {
      return new NextResponse('Invalid date', { status: 400 })
    }

    const quizUser = await userService.getQuizUser(session.uid)

    if (!quizUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    return NextResponse.json(await quizService.submitAnswers(date, quizUser, await request.json()))
  } catch (error) {
    if (error instanceof QuizSubmitError) {
      return new NextResponse(error.message, { status: error.status })
    }

    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const PATCH = withCsrf(PATCH_handler)
