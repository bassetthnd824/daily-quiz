import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const SESSION_COOKIE = 'daily-quiz-session'

// This function can be marked `async` if using `await` inside
export const middleware = async (request: NextRequest) => {
  const cookieStore = await cookies()

  if (!cookieStore.has(SESSION_COOKIE)) {
    if (!request.url.endsWith('/sign-in')) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  } else {
    if (request.url.endsWith('/sign-in')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
