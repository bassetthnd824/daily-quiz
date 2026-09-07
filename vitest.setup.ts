import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

process.env.CSRF_SECRET ??= 'test-csrf-secret'

vi.mock('@/firebase/client', () => ({
  auth: {
    setPersistence: vi.fn(),
  },
}))

vi.mock('next/image', async () => {
  const { createElement } = await import('react')
  return {
    default: ({ alt, src }: { alt: string; src: string }) => createElement('img', { alt, src }),
  }
})

afterEach(() => {
  cleanup()
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
