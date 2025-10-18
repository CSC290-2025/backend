export { fcmRoutes } from '@/modules/emergency/routes/fcm.route.ts';
export { tokenRoutes } from '@/modules/emergency/routes/token.route.ts';
import type { OpenAPIHono } from '@hono/zod-openapi';
import { setupEmergencyRoutes } from './emergency.routes';
import { emergencyAdminRoutes } from '../routes/admin.routes';
import { fcmRoutes, tokenRoutes } from '@/modules/emergency/routes';

export const setupRoutes = (app: OpenAPIHono) => {
  setupEmergencyRoutes(app);

  app.route('/api/v1/emergency/admin', emergencyAdminRoutes);

  app.route('/notifications', fcmRoutes);
  app.route('/tokens', tokenRoutes);
};
