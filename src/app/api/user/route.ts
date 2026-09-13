import { userService, UserProfileError } from '@/bo/user.bo'
import { withCsrf } from '@/util/csrf'
import { requireSession } from '@/util/require-session'
import { NextRequest, NextResponse } from 'next/server'

const PATCH_handler = async (request: NextRequest) => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    const quizUser = await userService.updateUserProfile(session.uid, await request.json())

    return NextResponse.json(quizUser)
  } catch (error) {
    if (error instanceof UserProfileError) {
      return new NextResponse(error.message, { status: error.status })
    }

    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const PATCH = withCsrf(PATCH_handler)
