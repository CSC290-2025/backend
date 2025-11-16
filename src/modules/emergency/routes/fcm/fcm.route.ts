import { FcmController } from '@/modules/emergency/controllers';
import { Hono } from 'hono';

const fcmRoutes = new Hono();

fcmRoutes.post('/all', FcmController.sendAllNotification);

export { fcmRoutes };
