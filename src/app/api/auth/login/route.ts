import { userService } from '@/bo/user.bo'
import { IS_PRODUCTION, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/constants/constants'
import { requireAuth } from '@/firebase/server'
import { setCsrfCookie, withCsrf } from '@/util/csrf'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const POST_handler = async (request: NextRequest) => {
  try {
    const auth = requireAuth()
    const body: unknown = await request.json()
    const idToken = body && typeof body === 'object' && 'idToken' in body && typeof body.idToken === 'string' ? body.idToken : ''

    if (!idToken) {
      return new NextResponse('Invalid id token', { status: 400 })
    }

    const decoded = await auth.verifyIdToken(idToken)
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    })

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, sessionCookie, {
      path: '/',
      httpOnly: true,
      maxAge: SESSION_MAX_AGE_SECONDS,
      sameSite: 'strict',
      secure: IS_PRODUCTION,
    })

    await setCsrfCookie()

    const userProfile = await userService.ensureUserProfile({
      userId: decoded.uid,
      displayName: decoded.name ?? '',
      photoURL: decoded.picture ?? '',
    })

    if (!userProfile) {
      return new NextResponse('Internal Error', { status: 500 })
    }

    const quizUser = await userService.getQuizUser(decoded.uid)

    if (!quizUser) {
      return new NextResponse('Internal Error', { status: 500 })
    }

    return NextResponse.json(quizUser)
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const POST = withCsrf(POST_handler)
