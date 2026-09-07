import { afterEach, describe, expect, it } from 'vitest'
import { CSRF_TOKEN_NAME } from '@/constants/constants'
import { csrfHeaders, getCookie } from './get-cookie'

describe('getCookie', () => {
  afterEach(() => {
    document.cookie.split(';').forEach((part) => {
      const name = part.split('=')[0]?.trim()
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      }
    })
  })

  it('returns an empty string when the cookie is missing', () => {
    expect(getCookie('missing')).toBe('')
  })

  it('returns the matching cookie value', () => {
    document.cookie = 'csrftoken=abc123; path=/'
    document.cookie = 'other=value; path=/'
    expect(getCookie('csrftoken')).toBe('abc123')
  })

  it('decodes URI-encoded values', () => {
    document.cookie = 'name=hello%20world; path=/'
    expect(getCookie('name')).toBe('hello world')
  })
})

describe('csrfHeaders', () => {
  afterEach(() => {
    document.cookie = `${CSRF_TOKEN_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  })

  it('returns an empty object when the CSRF cookie is missing', () => {
    expect(csrfHeaders()).toEqual({})
  })

  it('returns the CSRF header when the cookie is present', () => {
    document.cookie = `${CSRF_TOKEN_NAME}=token-value; path=/`
    expect(csrfHeaders()).toEqual({ [CSRF_TOKEN_NAME]: 'token-value' })
  })
})
