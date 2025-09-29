// export { userRoutes } from './user.routes';
import type { OpenAPIHono } from '@hono/zod-openapi';
import { setupUserRoutes } from './user.openapi.routes';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

// for future routes

// import { setupAuthRoutes } from '@/modules/auth/auth.routes';
// import { setupPaymentRoutes } from '@/modules/payment/payment.routes';
// import { setupEmergencyRoutes } from '@/modules/emergency/emergency.routes';
// etc, etc.

export const setupRoutes = (app: OpenAPIHono) => {
  setupUserRoutes(app);

  // team modules:

  // setupAuthRoutes(app);
  // setupPaymentRoutes(app);
  // setupEmergencyRoutes(app);
  // etc, etc.
};
