import { firestore } from '@/firebase/server'
import { UserProfile } from '@/models/user-profile.model'
import { NextRequest, NextResponse } from 'next/server'

const USERS = 'users'

export const GET = async (request: NextRequest, { params }: { params: { userId: string } }) => {
  try {
    if (!firestore) {
      return new NextResponse('Internal Error', { status: 500 })
    }

    const userDocument = await firestore
      .collection(USERS)
      .doc((await params).userId)
      .get()
    const userData = userDocument.data()
    const userProfile: UserProfile = {
      isAdmin: userData ? userData.isAdmin : false,
      canSubmitQuestions: userData ? userData.canSubmitQuestions : false,
      nickname: userData ? userData.nickname || '' : '',
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
