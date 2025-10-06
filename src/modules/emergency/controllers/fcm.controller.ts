import type { Context } from 'hono';
import { ValidationError } from '@/errors';
import { successResponse } from '@/utils/response.ts';
import { FcmService } from '@/modules/emergency/services';

export const sendAllNotification = async (c: Context) => {
  const { notification } = await c.req.json();

  if (!notification) {
    throw new ValidationError('Notification is required');
  }
  const response = await FcmService.sendAllNotificationService(notification);
  return successResponse(c, response);
};
