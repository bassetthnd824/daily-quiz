import { quizService } from '@/bo/quiz.bo'
import { firestore } from '@/firebase/server'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest, { params }: { params: Promise<{ date: string }> }) => {
  try {
    if (!firestore) {
      return new NextResponse('Internal Error: no firestore', { status: 500 })
    }

    const { date } = await params
    return NextResponse.json(await quizService.getQuizForDate(date))
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
