import { TokenController } from '@/modules/emergency/controllers';
import { Hono } from 'hono';

const tokenRoutes = new Hono();

tokenRoutes.post('/', TokenController.storeTokenToDB);

export { tokenRoutes };
