import 'server-only'

import { SESSION_COOKIE } from '@/constants/constants'
import { requireAuth } from '@/firebase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

export type Session = { ok: true; uid: string } | { ok: false; hadCookie: boolean }

export type RequireSessionResult = { ok: true; uid: string } | { ok: false; response: NextResponse }

export const getSession = async (): Promise<Session> => {
  const auth = requireAuth()
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)

  if (!sessionCookie?.value) {
    return { ok: false, hadCookie: false }
  }

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie.value, true)
    return { ok: true, uid: decoded.uid }
  } catch {
    return { ok: false, hadCookie: true }
  }
}

export const requireSession = async (): Promise<RequireSessionResult> => {
  const session = await getSession()

  if (!session.ok) {
    if (session.hadCookie) {
      const cookieStore = await cookies()
      cookieStore.delete({ name: SESSION_COOKIE, path: '/' })
    }

    return {
      ok: false,
      response: new NextResponse('Unauthorized', { status: 401 }),
    }
  }

  return session
}

export const requirePageSession = async (): Promise<string> => {
  const session = await getSession()

  if (!session.ok) {
    redirect('/sign-in')
  }

  return session.uid
}
