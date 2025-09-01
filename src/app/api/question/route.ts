import { questionService } from '@/bo/question.bo'
import { userService } from '@/bo/user.bo'
import { auth, firestore, SESSION_COOKIE } from '@/firebase/server'
import { QuestionStatus } from '@/models/question-status.model'
import { Question } from '@/models/question.model'
import { withCsrf } from '@/util/csrf-tokens'
import { getCurrentDate } from '@/util/utility'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const POST_handler = async (request: NextRequest) => {
  try {
    const cookieStore = await cookies()

    if (!cookieStore.has(SESSION_COOKIE)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    if (!firestore || !auth) {
      return new NextResponse('Internal Error: no firestore or no auth', { status: 500 })
    }

    const sessionCookie = cookieStore.get(SESSION_COOKIE)

    if (!sessionCookie) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { uid } = await auth.verifySessionCookie(sessionCookie.value, true)
    const question = await request.json()
    const quizUser = await userService.getQuizUser(uid)

    const newQuestion: Omit<Question, 'id'> = {
      text: question.text,
      answers: [question.correctAnswer, ...question.answers],
      lastUsedDate: '1111-11-11',
      status: QuestionStatus.PENDING,
      submittedBy: quizUser!.displayName,
      dateSubmitted: getCurrentDate(),
    }

    await questionService.addQuestion(newQuestion)

    return NextResponse.json('Question Added', { status: 201 })
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const POST = withCsrf(POST_handler)
