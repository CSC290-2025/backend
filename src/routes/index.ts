import type { OpenAPIHono } from '@hono/zod-openapi';
import { setupCleanAirRoutes } from '../modules/clean-air/routes';

// ============================================
// ROUTING OPTIONS:
// Choose ONE approach per module that you're comfortable with:
// 1. OpenAPI Routes - Documented in Swagger, type-safe with Zod
// 2. Normal Hono Routes - Simple, no Swagger docs
// ============================================

// OpenAPI Routes (documented in Swagger)
// import { setupAuthRoutes } from '@/modules/auth/routes';
// import { setupPaymentRoutes } from '@/modules/payment/routes';
// import { setupProductRoutes } from '@/modules/_example';
import { setupWasteRoutes } from '@/modules/waste-management/routes/waste.openapi.routes';

import { eventRoutes } from '../modules/Volunteer/routes';

export const setupRoutes = (app: OpenAPIHono) => {
  // ============================================
  // OpenAPI Routes (documented in Swagger)
  // ============================================
  // setupAuthRoutes(app);
  // setupPaymentRoutes(app);
  // setupProductRoutes(app);
  setupWasteRoutes(app);
  //
  setupCleanAirRoutes(app);

  // ============================================
  // Normal Hono Routes (not in Swagger docs)
  // ============================================
  app.route('/api/v1/volunteer/', eventRoutes);
};
