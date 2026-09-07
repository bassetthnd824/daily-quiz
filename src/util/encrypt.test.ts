import { generateKeyPairSync } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { encrypt } from './encrypt'
import { decrypt } from './decrypt'

const { publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

describe('encrypt', () => {
  afterEach(() => {
    delete process.env.PUBLIC_KEY
    delete process.env.PRIVATE_KEY
  })

  it('returns a base64 ciphertext when PUBLIC_KEY is set', async () => {
    process.env.PUBLIC_KEY = publicKey
    const ciphertext = await encrypt('hello')

    expect(ciphertext).not.toBe('')
    expect(() => Buffer.from(ciphertext, 'base64')).not.toThrow()
  })

  it('returns an empty string when encryption fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    delete process.env.PUBLIC_KEY
    await expect(encrypt('hello')).resolves.toBe('')
    error.mockRestore()
  })
})

describe('decrypt', () => {
  afterEach(() => {
    delete process.env.PRIVATE_KEY
  })

  it('returns an empty string when PRIVATE_KEY is missing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    delete process.env.PRIVATE_KEY
    await expect(decrypt('not-valid-ciphertext')).resolves.toBe('')
    error.mockRestore()
  })
})
