import { questionService, QuestionError } from '@/bo/question.bo'
import { userService } from '@/bo/user.bo'
import { withCsrf } from '@/util/csrf'
import { requireSession } from '@/util/require-session'
import { NextRequest, NextResponse } from 'next/server'

const PATCH_handler = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    const quizUser = await userService.getQuizUser(session.uid)

    if (!quizUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params

    await questionService.reviewQuestion(quizUser, id, await request.json())

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof QuestionError) {
      return new NextResponse(error.message, { status: error.status })
    }

    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const PATCH = withCsrf(PATCH_handler)
