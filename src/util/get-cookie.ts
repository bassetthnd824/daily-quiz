import { CSRF_TOKEN_NAME } from '@/constants/constants'

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

export const csrfHeaders = (): Record<string, string> => {
  const token = getCookie(CSRF_TOKEN_NAME)

  if (!token) {
    return {}
  }

  return { [CSRF_TOKEN_NAME]: token }
}
