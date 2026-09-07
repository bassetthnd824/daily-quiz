import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/constants/constants'
import { proxy } from './proxy'

const request = (path: string, cookies: Record<string, string> = {}) => {
  const headers = new Headers()
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')

  if (cookieHeader) {
    headers.set('cookie', cookieHeader)
  }

  return new NextRequest(`http://localhost:3000${path}`, { headers })
}

describe('proxy', () => {
  it('redirects unauthenticated requests away from protected pages', () => {
    const response = proxy(request('/todays-quiz'))
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('http://localhost:3000/sign-in')
  })

  it('allows the sign-in page without a session cookie', () => {
    expect(proxy(request('/sign-in'))).toBeUndefined()
  })

  it('allows authenticated requests', () => {
    expect(proxy(request('/todays-quiz', { [SESSION_COOKIE]: 'session' }))).toBeUndefined()
  })
})
