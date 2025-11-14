// Try uncomment setupProductRoutes & see openAPI in action at /swagger route
import type { OpenAPIHono } from '@hono/zod-openapi';

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
// import { productRoutes } from '@/modules/_example';
import {
  setupApartmentRoutes,
  setupRatingRoutes,
  setupRoomRoutes,
  setupAddressRoutes,
  setupUploadRoutes,
  setupBookingRoutes,
} from '@/modules/ApartmentListing';

import { setupCleanAirRoutes } from '../modules/clean-air/routes';

// Normal Hono Routes (not in Swagger docs)
// import { productRoutes } from '@/modules/_example';
import { eventRoutes } from '../modules/Volunteer/routes';

export const setupRoutes = (app: OpenAPIHono) => {
  /* 
  ============================================
  OpenAPI Routes (documented in Swagger)
  ============================================
  */

  // Apartment
  setupAddressRoutes(app);
  setupApartmentRoutes(app);
  setupRoomRoutes(app);
  setupRatingRoutes(app);
  setupUploadRoutes(app);
  setupBookingRoutes(app);

  // Clean Air
  setupCleanAirRoutes(app);

  /* 
  ============================================
   Normal Hono Routes (not in Swagger docs)
  ============================================
  */

  // Volunteer
  app.route('/api/v1/volunteer/', eventRoutes);
};
