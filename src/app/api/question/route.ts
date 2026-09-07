import { questionService } from '@/bo/question.bo'
import { userService } from '@/bo/user.bo'
import { firestore } from '@/firebase/server'
import { QuestionStatus } from '@/models/question-status.model'
import { Question } from '@/models/question.model'
import { withCsrf } from '@/util/csrf-tokens'
import { requireSession } from '@/util/require-session'
import { getCurrentDate } from '@/util/utility'
import { NextRequest, NextResponse } from 'next/server'

const POST_handler = async (request: NextRequest) => {
  try {
    const session = await requireSession()

    if (!session.ok) {
      return session.response
    }

    if (!firestore) {
      return new NextResponse('Internal Error: no firestore', { status: 500 })
    }

    const question = await request.json()
    const quizUser = await userService.getQuizUser(session.uid)

    if (!quizUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const newQuestion: Omit<Question, 'id'> = {
      text: question.text,
      answers: [question.correctAnswer, ...question.answers],
      lastUsedDate: '1111-11-11',
      status: QuestionStatus.PENDING,
      submittedBy: quizUser.displayName,
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
