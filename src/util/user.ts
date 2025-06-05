const USER_NAME = 'username'

export const getUserName = () => localStorage.getItem(USER_NAME)

export const setUserName = (username: string) => localStorage.setItem(USER_NAME, username)
