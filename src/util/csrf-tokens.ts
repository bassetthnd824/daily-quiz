import { CSRF_TOKEN_NAME } from '@/constants/constants'
import crypto from 'crypto'
import { NextRequest } from 'next/server'

const secret = process.env.CSRF_SECRET || 'a-very-secret-key'

if (secret === 'a-very-secret-key') {
  console.warn('WARNING: Using default CSRF secret. Set the CSRF_SECRET environment variable in production.')
}

export const generateCsrfToken = (): string => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(salt)
  return `${salt}-${hmac.digest('hex')}`
}

export const validateCsrfToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false
  }

  const parts = token.split('-')
  if (parts.length !== 2) {
    return false
  }

  const salt = parts[0]
  const hmacReceived = parts[1]

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(salt)
  const hmacCalculated = hmac.digest('hex')

  return crypto.timingSafeEqual(Buffer.from(hmacReceived), Buffer.from(hmacCalculated))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (req: NextRequest, context?: any) => Promise<Response>

export const withCsrf = (handler: Handler): Handler => {
  return async (req, context) => {
    const csrfToken = req.cookies.get(CSRF_TOKEN_NAME)?.value

    if (!csrfToken || !validateCsrfToken(csrfToken)) {
      return new Response('Invalid CSRF token', { status: 403 })
    }

    return handler(req, context)
  }
}

export const getCookie = (name: string) => {
  const cookieName = name + '='
  const decodedCookie = decodeURIComponent(document.cookie)
  const cookieArray = decodedCookie.split(';')

  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim()

    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length)
    }
  }

  return ''
}
