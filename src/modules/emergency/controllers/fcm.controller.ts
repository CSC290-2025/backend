import type { Context } from 'hono';
import { successResponse } from '@/utils/response.ts';
import { FcmService } from '@/modules/emergency/services';

export const sendAllNotification = async (c: Context) => {
  const body = await c.req.json();
  const fcm = await FcmService.sendAllNotificationService(body);
  return successResponse(c, { fcm }, 201, 'Create report successfully');
};
