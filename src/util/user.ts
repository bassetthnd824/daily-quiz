const USER_NAME = 'username'

export const getUserName = () => sessionStorage.getItem(USER_NAME)

export const setUserName = (username: string) => sessionStorage.setItem(USER_NAME, username)

export const clearUserName = () => sessionStorage.removeItem(USER_NAME)
