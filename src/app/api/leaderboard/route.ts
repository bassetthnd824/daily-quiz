import { quizService } from '@/bo/quiz.bo'
import { requireSession } from '@/util/require-session'
import { NextResponse } from 'next/server'

export const GET = async () => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    return NextResponse.json(await quizService.getLeaderboard())
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
