import crypto from 'crypto'

export const encrypt = async (plaintext: string) => {
  const bufferToEncrypt = Buffer.from(plaintext, 'utf-8')

  try {
    const key = process.env.PUBLIC_KEY
    const encryptedBuffer = crypto.publicEncrypt(
      {
        key: key!,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      bufferToEncrypt
    )

    return encryptedBuffer.toString('base64')

  } catch (e) {
    console.error('Encryption error', e)
    return ''
  }
}
