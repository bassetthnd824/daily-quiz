import { quizService, QuizSubmitError } from '@/bo/quiz.bo'
import { dateRangeSchema } from '@/schemas/quiz.schema'
import { withCsrf } from '@/util/csrf'
import { requireSession } from '@/util/require-session'
import { NextRequest, NextResponse } from 'next/server'
import * as v from 'valibot'

export const GET = async (request: NextRequest) => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    const dateRange = v.safeParse(dateRangeSchema, {
      begDate: request.nextUrl.searchParams.get('begDate'),
      endDate: request.nextUrl.searchParams.get('endDate'),
    })

    if (!dateRange.success) {
      return NextResponse.json([])
    }

    return NextResponse.json(await quizService.getCompletedQuizDates(session.uid, dateRange.output))
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

const POST_handler = async () => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    return NextResponse.json(await quizService.ensureTodaysQuiz(session.uid))
  } catch (error) {
    if (error instanceof QuizSubmitError) {
      return new NextResponse(error.message, { status: error.status })
    }

    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const POST = withCsrf(POST_handler)
