import type { Context } from 'hono';
import { TokenService } from '@/modules/emergency/services';
import { successResponse } from '@/utils/response.ts';

export const storeTokenToDB = async (c: Context) => {
  const body = await c.req.json();
  const token = await TokenService.storeTokenToDB(body);
  return successResponse(c, { token }, 201, 'Token stored successfully');
};
