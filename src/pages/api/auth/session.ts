import { decrypt } from '@/util/decrypt';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = req.cookies
  const decryptedSessionData = await decrypt(cookies.session!)

  res.status(200).json(decryptedSessionData)
}

export default handler