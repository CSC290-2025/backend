// Try uncomment setupProductRoutes & see openAPI in action at /swagger route
import type { OpenAPIHono } from '@hono/zod-openapi';
import { setupTrafficRoutes } from 'modules/traffic';
import { SetupMainTrafficRoutes } from 'modules/traffic';
//import { setupTrafficRoutes } from '@/modules/traffic/routes';
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

// Normal Hono Routes (not in Swagger docs)
// import { productRoutes } from '@/modules/_example';

export const setupRoutes = (app: OpenAPIHono) => {
  // ============================================
  // OpenAPI Routes (documented in Swagger)
  // ============================================
  // setupAuthRoutes(app);
  // setupPaymentRoutes(app);
  // setupProductRoutes(app);

  setupTrafficRoutes(app);
  SetupMainTrafficRoutes(app);
  //
  // ============================================
  // Normal Hono Routes (not in Swagger docs)
  // ============================================
};
