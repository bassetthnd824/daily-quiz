import { atou, createSecret, createToken, utoa, verifyToken } from '@edge-csrf/core'

const CONFIG = {
  SALT_LENGTH: 49,
  SECRET_LENGTH: 48,
}

const secretUint8Array = createSecret(CONFIG.SECRET_LENGTH)

export const generateCsrfToken = async (): Promise<string> => {
  const tokenUint8Arr = await createToken(secretUint8Array, CONFIG.SALT_LENGTH)
  return utoa(tokenUint8Arr)
}

export const verifyCsrfToken = async (token: string): Promise<boolean> => {
  const tokenUint8Arr = atou(token)
  return await verifyToken(tokenUint8Arr, secretUint8Array)
}
