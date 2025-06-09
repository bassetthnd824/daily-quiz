import { Question } from '@/models/question.model'

export type Quiz = {
  date: string;
  questions: Question[];
}
