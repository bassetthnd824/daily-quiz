import { NextApiRequest, NextApiResponse } from 'next'
import { quizService } from '@/services/quiz.service'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json(await quizService.getTodaysQuiz())
}

export default handler