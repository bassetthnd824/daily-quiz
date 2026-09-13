import { userService, UserProfileError } from '@/bo/user.bo'
import { withCsrf } from '@/util/csrf'
import { requireSession } from '@/util/require-session'
import { NextRequest, NextResponse } from 'next/server'

const loadAdmin = async () => {
  const session = await requireSession()

  if (!session.ok) {
    return session
  }

  const quizUser = await userService.getQuizUser(session.uid)

  if (!quizUser) {
    return { ok: false as const, response: new NextResponse('Unauthorized', { status: 401 }) }
  }

  return { ok: true as const, quizUser }
}

const PATCH_handler = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const admin = await loadAdmin()

    if (!admin.ok) {
      return admin.response
    }

    const { id } = await params
    const quizUser = await userService.reviewUser(admin.quizUser, id, await request.json())

    return NextResponse.json(quizUser)
  } catch (error) {
    if (error instanceof UserProfileError) {
      return new NextResponse(error.message, { status: error.status })
    }

    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

const DELETE_handler = async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const admin = await loadAdmin()

    if (!admin.ok) {
      return admin.response
    }

    const { id } = await params
    await userService.deleteAndBanUser(admin.quizUser, id)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof UserProfileError) {
      return new NextResponse(error.message, { status: error.status })
    }

    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const PATCH = withCsrf(PATCH_handler)
export const DELETE = withCsrf(DELETE_handler)
