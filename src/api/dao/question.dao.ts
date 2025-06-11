import masterQuestions from '@/questions'
import { Question } from '@/models/question.model'
import dayjs from 'dayjs'
import { DATE_FORMAT } from '@/util/utility'

const questions: Question[] = masterQuestions

const getQuestions = () => {
  return questions.filter(question => dayjs(question.lastUsedDate, DATE_FORMAT).isBefore(dayjs().subtract(30, 'day')))
}

export const questionDao = {
  getQuestions,
}