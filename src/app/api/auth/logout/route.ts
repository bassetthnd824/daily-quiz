export const dynamic = 'force-dynamic'

import { SESSION_COOKIE } from '@/firebase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async () => {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)

  return new NextResponse(undefined, { status: 200 })
}
