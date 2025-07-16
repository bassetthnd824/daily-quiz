import crypto from 'crypto';

const generateCookieSignatureKey = (length = 32) => {
    const buffer = crypto.randomBytes(length)
    return buffer.toString('base64url')
}

const secretKey = generateCookieSignatureKey()
console.log('Generated Cookie Signature Key:', secretKey)
