import { NextApiRequest, NextApiResponse } from 'next';
import {serialize} from "cookie";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookie = serialize('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  })

  res.setHeader('Set-Cookie', cookie)
  res.status(200).json({ message: 'Successfully logged in' })
}

export default handler