import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/constants/constants'

export const middleware = async (request: NextRequest) => {
  // Presence-only: Edge cannot verify Firebase session cookies. Pages use
  // requirePageSession / getSession so an expired cookie cannot bounce /sign-in back to /.
  const { pathname } = request.nextUrl
  const cookieStore = await cookies()

  if (!cookieStore.has(SESSION_COOKIE) && pathname !== '/sign-in') {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes; session is verified in requireSession)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
