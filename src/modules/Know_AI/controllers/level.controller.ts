import type { Context } from 'hono';
import { levelService } from '@/modules/Know_AI/services';
import { successResponse } from '@/utils/response.ts';

const getLevel = async (c: Context) => {
  const userId = Number(c.req.param('user_id'));
  const level = await levelService.getLevel(userId);
  return successResponse(c, { level });
};

export { getLevel };
