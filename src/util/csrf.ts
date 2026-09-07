import 'server-only'

import { CSRF_TOKEN_NAME, IS_PRODUCTION, SESSION_MAX_AGE_SECONDS } from '@/constants/constants'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const secret = process.env.CSRF_SECRET

if (!secret) {
  throw new Error('CSRF_SECRET is not set')
}

const csrfSecret: string = secret

const csrfCookieOptions = {
  path: '/',
  httpOnly: false,
  maxAge: SESSION_MAX_AGE_SECONDS,
  sameSite: 'strict' as const,
  secure: IS_PRODUCTION,
}

const timingSafeEqualStrings = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

export const generateCsrfToken = (): string => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hmac = crypto.createHmac('sha256', csrfSecret)
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

  const [salt, hmacReceived] = parts
  const hmac = crypto.createHmac('sha256', csrfSecret)
  hmac.update(salt)
  const hmacCalculated = hmac.digest('hex')

  return timingSafeEqualStrings(hmacReceived, hmacCalculated)
}

export const setCsrfCookie = async () => {
  const cookieStore = await cookies()
  cookieStore.set(CSRF_TOKEN_NAME, generateCsrfToken(), csrfCookieOptions)
}

export const clearCsrfCookie = async () => {
  const cookieStore = await cookies()
  cookieStore.delete({ name: CSRF_TOKEN_NAME, path: '/' })
}

export const withCsrf = <TContext>(handler: (req: NextRequest, context: TContext) => Promise<Response>) => {
  return async (req: NextRequest, context: TContext) => {
    const cookieToken = req.cookies.get(CSRF_TOKEN_NAME)?.value ?? ''
    const headerToken = req.headers.get(CSRF_TOKEN_NAME) ?? ''

    if (
      !cookieToken ||
      !headerToken ||
      !timingSafeEqualStrings(cookieToken, headerToken) ||
      !validateCsrfToken(cookieToken)
    ) {
      return new NextResponse('Invalid CSRF token', { status: 403 })
    }

    return handler(req, context)
  }
}
