import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SESSION_COOKIE } from '@/constants/constants'

const cookieGet = vi.fn()
const cookieDelete = vi.fn()
const verifySessionCookie = vi.fn()
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`)
})

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: cookieGet,
    delete: cookieDelete,
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirect(url),
}))

vi.mock('@/firebase/server', () => ({
  requireAuth: vi.fn(() => ({
    verifySessionCookie,
  })),
}))

describe('require-session', () => {
  beforeEach(() => {
    cookieGet.mockReset()
    cookieDelete.mockReset()
    verifySessionCookie.mockReset()
    redirect.mockClear()
  })

  it('returns not-ok when the session cookie is missing', async () => {
    const { getSession } = await import('./require-session')
    cookieGet.mockReturnValue(undefined)

    await expect(getSession()).resolves.toEqual({ ok: false, hadCookie: false })
  })

  it('returns the uid when the session cookie is valid', async () => {
    const { getSession } = await import('./require-session')
    cookieGet.mockReturnValue({ value: 'session' })
    verifySessionCookie.mockResolvedValue({ uid: 'user-1' })

    await expect(getSession()).resolves.toEqual({ ok: true, uid: 'user-1' })
  })

  it('clears an invalid cookie and returns 401 from requireSession', async () => {
    const { requireSession } = await import('./require-session')
    cookieGet.mockReturnValue({ value: 'expired' })
    verifySessionCookie.mockRejectedValue(new Error('expired'))

    const result = await requireSession()
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(401)
    }
    expect(cookieDelete).toHaveBeenCalledWith({ name: SESSION_COOKIE, path: '/' })
  })

  it('redirects unauthenticated page requests to sign-in', async () => {
    const { requirePageSession } = await import('./require-session')
    cookieGet.mockReturnValue(undefined)

    await expect(requirePageSession()).rejects.toThrow('REDIRECT:/sign-in')
  })

  it('returns the uid for authenticated page requests', async () => {
    const { requirePageSession } = await import('./require-session')
    cookieGet.mockReturnValue({ value: 'session' })
    verifySessionCookie.mockResolvedValue({ uid: 'user-1' })

    await expect(requirePageSession()).resolves.toBe('user-1')
  })
})
