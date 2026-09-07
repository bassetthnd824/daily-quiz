import { SESSION_COOKIE } from '@/constants/constants'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async () => {
  const cookieStore = await cookies()
  cookieStore.delete({ name: SESSION_COOKIE, path: '/' })

  return new NextResponse(undefined, { status: 200 })
}
