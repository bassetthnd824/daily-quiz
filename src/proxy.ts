import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/constants/constants'

export const proxy = (request: NextRequest) => {
  // Presence-only: pages use requirePageSession / getSession so an expired
  // cookie cannot bounce /sign-in back to /.
  const { pathname } = request.nextUrl

  if (!request.cookies.has(SESSION_COOKIE) && pathname !== '/sign-in') {
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
