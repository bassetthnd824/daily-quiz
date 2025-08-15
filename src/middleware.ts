import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CSRF_TOKEN_NAME, ERROR_CODE_INVALID_CSRF, IS_PRODUCTION } from '@/util/constants'
import { generateCsrfToken, verifyCsrfToken } from '@/util/csrf-tokens'

export const SESSION_COOKIE = 'daily-quiz-session'

// This function can be marked `async` if using `await` inside
export const middleware = async (request: NextRequest) => {
  const cookieStore = await cookies()

  if (request.url.includes('/api/')) {
    const responseNext = NextResponse.next()

    if (['PUT', 'PATCH', 'DELETE', 'POST'].includes(request.method)) {
      const invalidCsrfTokenResponse = NextResponse.json({ message: ERROR_CODE_INVALID_CSRF }, { status: 403 })

      try {
        const csrfRequestToken = cookieStore.get(CSRF_TOKEN_NAME)?.value ?? ''
        console.log(csrfRequestToken)
        const isTokenValid = await verifyCsrfToken(csrfRequestToken)

        if (!isTokenValid) {
          console.log('Token did not verify')
          return invalidCsrfTokenResponse
        }
      } catch (error) {
        console.error(error)
        return invalidCsrfTokenResponse
      }
    } else if (request.method === 'GET' && !request.cookies.has(CSRF_TOKEN_NAME)) {
      try {
        const csrfResponseToken = await generateCsrfToken()
        responseNext.cookies.set(CSRF_TOKEN_NAME, csrfResponseToken, {
          sameSite: 'lax',
          httpOnly: false,
          secure: IS_PRODUCTION,
          maxAge: 3600,
        })
      } catch (error) {
        console.error(error)
      }
    }

    return responseNext
  } else {
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
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
