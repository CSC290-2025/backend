import { FcmController } from '@/controllers';
import { Hono } from 'hono';

const fcmRoutes = new Hono();

fcmRoutes.post('/all', FcmController.sendAllNotification);

export { fcmRoutes };
