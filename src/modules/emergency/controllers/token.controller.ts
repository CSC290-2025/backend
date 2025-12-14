import type { Context, Handler } from 'hono';
import { TokenService } from '@/modules/emergency/services';
import { successResponse } from '@/utils/response.ts';

export const storeTokenToDB = async (c: Context) => {
  const body = await c.req.json();
  const token = await TokenService.storeTokenToDB(body);
  return successResponse(c, { token }, 201, 'Token stored successfully');
};

export const getTokenByUserId: Handler = async (c: Context) => {
  const { user_id } = c.req.param();
  const newUserId = Number(user_id);
  const token = await TokenService.getTokenByUserId(newUserId);
  return successResponse(c, { token }, 201, 'Get token by UserId successfully');
};
