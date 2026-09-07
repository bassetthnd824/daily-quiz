import { SESSION_COOKIE } from '@/constants/constants'
import { clearCsrfCookie, withCsrf } from '@/util/csrf'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const POST_handler = async (_request: NextRequest) => {
  const cookieStore = await cookies()
  cookieStore.delete({ name: SESSION_COOKIE, path: '/' })
  await clearCsrfCookie()

  return new NextResponse(undefined, { status: 200 })
}

export const POST = withCsrf(POST_handler)
