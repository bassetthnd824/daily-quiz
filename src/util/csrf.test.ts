import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CSRF_TOKEN_NAME } from '@/constants/constants'
import { NextRequest } from 'next/server'

const cookieSet = vi.fn()
const cookieDelete = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    set: cookieSet,
    delete: cookieDelete,
  })),
}))

describe('csrf', () => {
  beforeEach(() => {
    cookieSet.mockReset()
    cookieDelete.mockReset()
  })

  it('generates a token that validates against the same secret', async () => {
    const { generateCsrfToken, validateCsrfToken } = await import('./csrf')
    const token = generateCsrfToken()

    expect(token).toMatch(/^[a-f0-9]+-[a-f0-9]+$/)
    expect(validateCsrfToken(token)).toBe(true)
  })

  it('rejects missing, malformed, and tampered tokens', async () => {
    const { generateCsrfToken, validateCsrfToken } = await import('./csrf')
    const token = generateCsrfToken()
    const [salt, hmac] = token.split('-')

    expect(validateCsrfToken('')).toBe(false)
    expect(validateCsrfToken('no-hmac-extra')).toBe(false)
    expect(validateCsrfToken(`${salt}-${hmac.slice(0, -1)}x`)).toBe(false)
  })

  it('sets and clears the CSRF cookie', async () => {
    const { setCsrfCookie, clearCsrfCookie } = await import('./csrf')

    await setCsrfCookie()
    expect(cookieSet).toHaveBeenCalledWith(
      CSRF_TOKEN_NAME,
      expect.stringMatching(/^[a-f0-9]+-[a-f0-9]+$/),
      expect.objectContaining({ path: '/', httpOnly: false, sameSite: 'strict' }),
    )

    await clearCsrfCookie()
    expect(cookieDelete).toHaveBeenCalledWith({ name: CSRF_TOKEN_NAME, path: '/' })
  })

  it('rejects requests with a missing or mismatched CSRF header', async () => {
    const { generateCsrfToken, withCsrf } = await import('./csrf')
    const token = generateCsrfToken()
    const handler = vi.fn(async () => new Response('ok'))
    const wrapped = withCsrf(handler)

    const missing = new NextRequest('http://localhost/api/quiz', { method: 'POST' })
    expect((await wrapped(missing, undefined)).status).toBe(403)

    const mismatched = new NextRequest('http://localhost/api/quiz', {
      method: 'POST',
      headers: {
        cookie: `${CSRF_TOKEN_NAME}=${token}`,
        [CSRF_TOKEN_NAME]: 'other-token',
      },
    })
    expect((await wrapped(mismatched, undefined)).status).toBe(403)
    expect(handler).not.toHaveBeenCalled()
  })

  it('calls the handler when cookie and header tokens match', async () => {
    const { generateCsrfToken, withCsrf } = await import('./csrf')
    const token = generateCsrfToken()
    const handler = vi.fn(async () => new Response('ok'))
    const wrapped = withCsrf(handler)

    const request = new NextRequest('http://localhost/api/quiz', {
      method: 'POST',
      headers: {
        cookie: `${CSRF_TOKEN_NAME}=${token}`,
        [CSRF_TOKEN_NAME]: token,
      },
    })

    const response = await wrapped(request, undefined)
    expect(response.status).toBe(200)
    expect(handler).toHaveBeenCalledOnce()
  })
})
