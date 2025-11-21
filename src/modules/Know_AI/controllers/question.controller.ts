import type { Context } from 'hono';
import { QuestionService } from '@/modules/Know_AI/services';
import { successResponse } from '@/utils/response.ts';

const getQuestion = async (c: Context) => {
  const questionId = Number(c.req.param('id'));
  const question = await QuestionService.getQuestion(questionId);
  return successResponse(c, { question });
};

export { getQuestion };
