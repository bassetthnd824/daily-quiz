import { describe, expect, it, vi } from 'vitest'

const { onSchedule, createTodaysQuiz } = vi.hoisted(() => ({
  onSchedule: vi.fn((_options: unknown, handler: unknown) => handler),
  createTodaysQuiz: vi.fn(),
}))

vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn(() => [{ name: '[DEFAULT]' }]),
  initializeApp: vi.fn(),
}))

vi.mock('firebase-functions/v2/scheduler', () => ({
  onSchedule,
}))

vi.mock('./create-todays-quiz.js', () => ({
  createTodaysQuiz,
}))

describe('createDailyQuiz', () => {
  it('schedules weekday quiz creation at 5:00 AM Chicago time', async () => {
    const { createDailyQuiz } = await import('./index.js')

    expect(onSchedule).toHaveBeenCalledWith(
      {
        schedule: '0 5 * * 1-5',
        timeZone: 'America/Chicago',
        region: 'us-central1',
      },
      expect.any(Function),
    )

    await (createDailyQuiz as unknown as () => Promise<void>)()

    expect(process.env.TZ).toBe('America/Chicago')
    expect(createTodaysQuiz).toHaveBeenCalledOnce()
  })
})
