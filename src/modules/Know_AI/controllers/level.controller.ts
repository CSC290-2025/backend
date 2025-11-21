import type { Context } from 'hono';
import { levelService } from '@/modules/Know_AI/services';
import { successResponse } from '@/utils/response.ts';

const getLevel = async (c: Context) => {
  const userId = Number(c.req.param('user_id'));
  const level = await levelService.getLevel(userId);
  return successResponse(c, { level });
};

const completeLevel = async (c: Context) => {
  const level = Number(c.req.param('level'));
  const body = await c.req.json();
  const { user_id } = body;
  const result = await levelService.completeLevel(user_id, level);
  return successResponse(c, result);
};

export { getLevel, completeLevel };
