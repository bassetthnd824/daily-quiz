import { userService } from '@/bo/user.bo'
import { CSRF_TOKEN_NAME, IS_PRODUCTION, ONE_HOUR, TWO_WEEKS } from '@/constants/constants'
import { auth, firestore, SESSION_COOKIE } from '@/firebase/server'
import { generateCsrfToken } from '@/util/csrf-tokens'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (request: NextRequest) => {
  try {
    if (!firestore || !auth) {
      return new NextResponse('Internal Error: no firestore or no auth', { status: 500 })
    }

    const postBody: {
      idToken: string
      userId: string
      displayName: string
      photoURL: string
    } = await request.json()

    const cookieStore = await cookies()
    const sessionCookie = await auth?.createSessionCookie(postBody.idToken, {
      expiresIn: TWO_WEEKS,
    })

    cookieStore.set(SESSION_COOKIE, sessionCookie, {
      path: '/',
      httpOnly: true,
      maxAge: TWO_WEEKS,
      sameSite: 'strict',
      secure: IS_PRODUCTION,
    })

    cookieStore.set(CSRF_TOKEN_NAME, generateCsrfToken(), {
      path: '/',
      httpOnly: false,
      maxAge: ONE_HOUR,
      sameSite: 'strict',
      secure: IS_PRODUCTION,
    })

    const userProfile = await userService.getUserProfile(postBody.userId)

    if (userProfile) {
      return NextResponse.json(userProfile)
    } else {
      return NextResponse.json(await userService.createUserProfile(postBody))
    }
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
