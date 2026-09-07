import { userService } from '@/bo/user.bo'
import { CSRF_MAX_AGE_SECONDS, CSRF_TOKEN_NAME, IS_PRODUCTION } from '@/constants/constants'
import { generateCsrfToken } from '@/util/csrf-tokens'
import { requireSession } from '@/util/require-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async () => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    const quizUser = await userService.getQuizUser(session.uid)

    if (!quizUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set(CSRF_TOKEN_NAME, generateCsrfToken(), {
      path: '/',
      httpOnly: false,
      maxAge: CSRF_MAX_AGE_SECONDS,
      sameSite: 'strict',
      secure: IS_PRODUCTION,
    })

    return NextResponse.json(quizUser)
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
