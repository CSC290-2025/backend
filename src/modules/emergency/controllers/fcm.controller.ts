import type { Context } from 'hono';
import { successResponse } from '@/utils/response.ts';
import { FcmService } from '@/modules/emergency/services';

export const sendAllNotification = async (c: Context) => {
  const body = await c.req.json();
  const fcm = await FcmService.sendAllNotificationService(body);
  return successResponse(c, { fcm }, 201, 'Send all FCM successfully');
};

export const sendNotificationToToken = async (c: Context) => {
  const { token, notification } = await c.req.json();

  if (!token || !notification) {
    return c.json({ error: 'Missing token or notification' }, 400);
  }

  const fcm = await FcmService.sendNotificationToToken(token, { notification });
  return successResponse(c, { fcm }, 201, 'Send FCM to token successfully');
};
