import type { OpenAPIHono } from '@hono/zod-openapi';
import { setupAddressRoutes } from '@/modules/citizens/routes/adressG5.openapi.route';
import { setupUserSpecialistRoutes } from '@/modules/citizens/routes/specialistG6.openapi.route';
import {
  setupUserG8Routes,
  setupUserSpecialtyRoutes,
  setupUserRoutes,
} from '@/modules/citizens/routes';
import { setupRoleUserRoutes } from '../modules/citizens/routes/userRoleG11.openapi.routes';
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
  setupCleanAirRoutes(app);

  // ============================================
  // Normal Hono Routes (not in Swagger docs)
  // ============================================
  // app.route('/products', productRoutes);
  setupAddressRoutes(app);
  setupUserSpecialistRoutes(app);
  setupUserSpecialtyRoutes(app);
  setupUserG8Routes(app);
  setupRoleUserRoutes(app);
  setupUserRoutes(app);
  app.route('/api/v1/volunteer/', eventRoutes);
};
