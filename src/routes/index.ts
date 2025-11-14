import type { OpenAPIHono } from '@hono/zod-openapi';
import { setupCleanAirRoutes } from '../modules/clean-air/routes';

// ============================================
// ROUTING OPTIONS:
// Choose ONE approach per module that you're comfortable with:
// 1. OpenAPI Routes - Documented in Swagger, type-safe with Zod
// 2. Normal Hono Routes - Simple, no Swagger docs

// Normal Hono Routes (not in Swagger docs)
// import { productRoutes } from '@/modules/_example';
import {
  setupFreecyclePostsRoutes,
  setupCategoryRoutes,
  setupFreecyclePostCategoriesPostRoutes,
} from '@/modules/freecycle';
import { eventRoutes } from '../modules/Volunteer/routes';

export const setupRoutes = (app: OpenAPIHono) => {
  // ============================================
  // OpenAPI Routes (documented in Swagger)
  // ============================================
  // setupAuthRoutes(app);
  // setupPaymentRoutes(app);
  // setupProductRoutes(app);
  setupFreecyclePostsRoutes(app);
  setupCategoryRoutes(app);
  setupFreecyclePostCategoriesPostRoutes(app);
  //
  setupCleanAirRoutes(app);

  // ============================================
  // Normal Hono Routes (not in Swagger docs)
  // ============================================
  app.route('/api/v1/volunteer/', eventRoutes);
};
