import { userService } from '@/bo/user.bo'
import { setCsrfCookie } from '@/util/csrf'
import { requireSession } from '@/util/require-session'
import { NextResponse } from 'next/server'

export const GET = async () => {
  try {
    await setCsrfCookie()

    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    const quizUser = await userService.getQuizUser(session.uid)

    if (!quizUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    return NextResponse.json(quizUser)
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
