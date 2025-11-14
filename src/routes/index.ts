import type { OpenAPIHono } from '@hono/zod-openapi';

// ============================================
// ROUTING OPTIONS:
// Choose ONE approach per module that you're comfortable with:
// 1. OpenAPI Routes - Documented in Swagger, type-safe with Zod
// 2. Normal Hono Routes - Simple, no Swagger docs

import { setupCleanAirRoutes } from '../modules/clean-air/routes';
import {
  setupWalletRoutes,
  setupScbRoutes,
  setupMetroCardRoutes,
} from '@/modules/Financial';

// Normal Hono Routes (not in Swagger docs)
// import { productRoutes } from '@/modules/_example';
import { eventRoutes } from '../modules/Volunteer/routes';

export const setupRoutes = (app: OpenAPIHono) => {
  /* 
  ============================================
  OpenAPI Routes (documented in Swagger)
  ============================================
  */
  // setupAuthRoutes(app);
  // setupPaymentRoutes(app);
  // setupProductRoutes(app);

  // Clean Air
  setupCleanAirRoutes(app);

  // Financial
  setupMetroCardRoutes(app);
  setupWalletRoutes(app);
  setupScbRoutes(app);

  /* 
  ============================================
   Normal Hono Routes (not in Swagger docs)
  ============================================
  */

  // Volunteer
  app.route('/api/v1/volunteer/', eventRoutes);
};
