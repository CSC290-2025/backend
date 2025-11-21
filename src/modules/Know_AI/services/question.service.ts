import { QuestionModel } from '@/modules/Know_AI/models';
import type { question, questionId } from '@/modules/Know_AI/types';

const getQuestion = async (id: number): Promise<question> => {
  console.log(id);
  return await QuestionModel.getQuestion(id);
};

export { getQuestion };
