import { questionService, QuestionSubmitError } from '@/bo/question.bo'
import { userService } from '@/bo/user.bo'
import { withCsrf } from '@/util/csrf'
import { requireSession } from '@/util/require-session'
import { NextRequest, NextResponse } from 'next/server'

const POST_handler = async (request: NextRequest) => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    const quizUser = await userService.getQuizUser(session.uid)

    if (!quizUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await questionService.submitQuestion(quizUser, await request.json())

    return NextResponse.json('Question Added', { status: 201 })
  } catch (error) {
    if (error instanceof QuestionSubmitError) {
      return new NextResponse(error.message, { status: error.status })
    }

    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const POST = withCsrf(POST_handler)
