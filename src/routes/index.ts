// Try uncomment setupProductRoutes & see openAPI in action at /swagger route
import type { OpenAPIHono } from '@hono/zod-openapi';
import { setupAddressRoutes } from '@/modules/citizens/routes/adressG5.openapi.route';
import { setupUserSpecialistRoutes } from '@/modules/citizens/routes/specialistG6.openapi.route';
import {
  setupUserRoutes,
  setupUserSpecialtyRoutes,
} from '@/modules/citizens/routes';
import { setupRoleUserRoutes } from '../modules/citizens/routes/userRoleG11.openapi.routes';
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
  //
  // ============================================
  // Normal Hono Routes (not in Swagger docs)
  // ============================================
  // app.route('/products', productRoutes);
  setupAddressRoutes(app);
  setupUserSpecialistRoutes(app);
  setupUserSpecialtyRoutes(app);
  setupUserRoutes(app);
  setupRoleUserRoutes(app);
};
