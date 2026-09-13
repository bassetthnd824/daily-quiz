import { describe, expect, it, vi } from 'vitest'

const { onSchedule, beforeUserCreated, createTodaysQuiz, seedUserProfile } = vi.hoisted(() => ({
  onSchedule: vi.fn((_options: unknown, handler: unknown) => handler),
  beforeUserCreated: vi.fn((_options: unknown, handler: unknown) => handler),
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

vi.mock('firebase-functions/v2/identity', () => ({
  beforeUserCreated,
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
    expect(beforeUserCreated).toHaveBeenCalledWith({ region: 'us-central1' }, expect.any(Function))

    await (createDailyQuiz as unknown as () => Promise<void>)()

    expect(process.env.TZ).toBe('America/Chicago')
    expect(createTodaysQuiz).toHaveBeenCalledOnce()

    const { onUserCreate } = await import('./index.js')
    const user = { uid: 'user-1', displayName: 'Ada Lovelace', photoURL: 'https://example.com/ada.png' }
    await (onUserCreate as (event: { data?: typeof user }) => Promise<void>)({ data: user })
    expect(seedUserProfile).toHaveBeenCalledWith(user)
  })
})
