import { SESSION_COOKIE } from '@/constants/constants'
import { clearCsrfCookie, withCsrf } from '@/util/csrf'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const POST_handler = async () => {
  const cookieStore = await cookies()
  cookieStore.delete({ name: SESSION_COOKIE, path: '/' })
  await clearCsrfCookie()

  return new NextResponse(undefined, { status: 200 })
}

export const POST = withCsrf(POST_handler)
