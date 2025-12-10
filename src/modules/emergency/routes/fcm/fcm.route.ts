import { FcmController } from '@/modules/emergency/controllers';
import { Hono } from 'hono';

export function fcmRoutes() {
  const app = new Hono();

  app.post('/fcm/all', FcmController.sendAllNotification);
  app.post('/fcm/token', FcmController.sendNotificationToToken);

  return app;
}
