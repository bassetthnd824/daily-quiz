import { describe, expect, it, vi } from 'vitest'

const { onSchedule, onCreate, createTodaysQuiz, seedUserProfile } = vi.hoisted(() => ({
  onSchedule: vi.fn((_options: unknown, handler: unknown) => handler),
  onCreate: vi.fn((handler: unknown) => handler),
  createTodaysQuiz: vi.fn(),
  seedUserProfile: vi.fn(),
}))

vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn(() => [{ name: '[DEFAULT]' }]),
  initializeApp: vi.fn(),
}))

vi.mock('firebase-functions/v2/scheduler', () => ({
  onSchedule,
}))

vi.mock('firebase-functions/v1', () => ({
  auth: {
    user: () => ({ onCreate }),
  },
}))

vi.mock('./create-todays-quiz.js', () => ({
  createTodaysQuiz,
}))

vi.mock('./seed-user-profile.js', () => ({
  seedUserProfile,
}))

describe('scheduled functions', () => {
  it('wires quiz creation and user seeding', async () => {
    const { createDailyQuiz } = await import('./index.js')

    expect(onSchedule).toHaveBeenCalledWith(
      {
        schedule: '0 5 * * 1-5',
        timeZone: 'America/Chicago',
        region: 'us-central1',
      },
      expect.any(Function),
    )
    expect(onCreate).toHaveBeenCalledWith(seedUserProfile)

    await (createDailyQuiz as unknown as () => Promise<void>)()

    expect(process.env.TZ).toBe('America/Chicago')
    expect(createTodaysQuiz).toHaveBeenCalledOnce()
  })
})
