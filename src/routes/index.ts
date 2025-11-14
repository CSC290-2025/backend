import type { OpenAPIHono } from '@hono/zod-openapi';
import { setupTrafficRoutes } from 'modules/traffic';
//import { setupTrafficRoutes } from '@/modules/traffic/routes';
import { setupCleanAirRoutes } from '../modules/clean-air/routes';

// ============================================
// ROUTING OPTIONS:
// Choose ONE approach per module that you're comfortable with:
// 1. OpenAPI Routes - Documented in Swagger, type-safe with Zod
// 2. Normal Hono Routes - Simple, no Swagger docs

import { eventRoutes } from '../modules/Volunteer/routes';

export const setupRoutes = (app: OpenAPIHono) => {
  // ============================================
  // OpenAPI Routes (documented in Swagger)
  // ============================================
  // setupAuthRoutes(app);
  // setupPaymentRoutes(app);
  // setupProductRoutes(app);

  setupTrafficRoutes(app);

  //
  // ============================================
  // Normal Hono Routes (not in Swagger docs)
  // ============================================

  //setupTrafficRoutes(app);
  setupCleanAirRoutes(app);

  // ============================================
  // Normal Hono Routes (not in Swagger docs)
  // ============================================
  app.route('/api/v1/volunteer/', eventRoutes);
};
