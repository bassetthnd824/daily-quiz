import { encrypt } from '@/util/encrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie'
import { SessionData } from '@/models/session-data.types'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionData: SessionData = req.body
  const encryptedSessionData = await encrypt(sessionData.username)

  const cookie = serialize('session', encryptedSessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  })

  res.setHeader('Set-Cookie', cookie)
  res.status(200).json({ message: 'Successfully logged in' })
}

export default handler