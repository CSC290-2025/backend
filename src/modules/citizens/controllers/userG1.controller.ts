import type { Context } from 'hono';
import { UserG1Service } from '../services';
import { successResponse } from '@/utils/response';

const getUserAddress = async (c: Context) => {
  const user_id = parseInt(c.req.param('id'));
  const user = await UserG1Service.getUserAddress(user_id);
  return successResponse(c, { user }, 200, 'User address fetch successfully');
};

export { getUserAddress };
