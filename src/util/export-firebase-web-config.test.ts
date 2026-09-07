import { describe, expect, it } from 'vitest'
import { toExportLines } from '../../scripts/export-firebase-web-config.mjs'

const validConfig = {
  apiKey: 'api-key',
  authDomain: 'example.firebaseapp.com',
  projectId: 'example',
  storageBucket: 'example.appspot.com',
  messagingSenderId: '123',
  appId: '1:123:web:abc',
}

describe('toExportLines', () => {
  it('emits export lines for each Next.js Firebase env var', () => {
    expect(toExportLines(validConfig)).toBe(
      [
        'export NEXT_PUBLIC_FIREBASE_API_KEY="api-key"',
        'export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="example.firebaseapp.com"',
        'export NEXT_PUBLIC_FIREBASE_PROJECT_ID="example"',
        'export NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="example.appspot.com"',
        'export NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123"',
        'export NEXT_PUBLIC_FIREBASE_APP_ID="1:123:web:abc"',
      ].join('\n'),
    )
  })

  it('rejects missing keys', () => {
    expect(() => toExportLines({ ...validConfig, apiKey: '' })).toThrow('FIREBASE_WEB_CONFIG missing apiKey')
  })

  it('rejects non-objects', () => {
    expect(() => toExportLines('not-json-object')).toThrow('FIREBASE_WEB_CONFIG must be a JSON object')
  })
})
