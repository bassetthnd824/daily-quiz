import crypto from 'crypto'

export const decrypt = async (data: string) => {
  const encryptedData = Buffer.from(data, 'base64')

  try {
    const key = process.env.PRIVATE_KEY
    const encryptedBuffer = crypto.publicEncrypt(
      {
        key: key!,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },

      encryptedData
    )

    return encryptedBuffer.toString('utf-8')
  } catch (e) {
    console.error('Decryption error', e)
    return ''
  }
}
