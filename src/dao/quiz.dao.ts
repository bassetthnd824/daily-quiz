import { Quiz } from "@/models/quiz.model";

const quizes: Quiz[] = []

const getQuizForDate = (date: string) => {
  return quizes.find(quiz => quiz.date === date)
}

const addQuiz = (quiz: Quiz) => {
  //quizes.push(quiz)
}

export const quizDao = {
  getQuizForDate,
  addQuiz,
}
