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

// Normal Hono Routes (not in Swagger docs)
// import { productRoutes } from '@/modules/_example';
import { apartmentRoutes } from '@/modules/ApartmentListing/routes/apartment.route';
import { bookingRoute } from '@/modules/ApartmentListing/routes/booking.route';
import { ratingRoutes } from '@/modules/ApartmentListing/routes/rating.route';
import { roomRoutes } from '@/modules/ApartmentListing/routes/room.route';
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
  app.route('/apartments', apartmentRoutes);
  app.route('/bookings', bookingRoute);
  app.route('/ratings', ratingRoutes);
  app.route('/rooms', roomRoutes);
};
