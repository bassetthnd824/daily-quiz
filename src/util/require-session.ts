import 'server-only'

import { SESSION_COOKIE } from '@/constants/constants'
import { auth } from '@/firebase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export type RequireSessionResult = { ok: true; uid: string } | { ok: false; response: NextResponse }

export const requireSession = async (): Promise<RequireSessionResult> => {
  if (!auth) {
    return {
      ok: false,
      response: new NextResponse('Internal Error: no auth', { status: 500 }),
    }
  }

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)

  if (!sessionCookie?.value) {
    return {
      ok: false,
      response: new NextResponse('Unauthorized', { status: 401 }),
    }
  }

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie.value, true)
    return { ok: true, uid: decoded.uid }
  } catch {
    cookieStore.delete({ name: SESSION_COOKIE, path: '/' })
    return {
      ok: false,
      response: new NextResponse('Unauthorized', { status: 401 }),
    }
  }
}
