// Try uncomment setupProductRoutes & see openAPI in action at /swagger route
import type { OpenAPIHono } from '@hono/zod-openapi';
// import { detectRoutes } from '../modules/G-16/routes/detect.routes.js';
import markerRoutes from '../modules/G-16/routes/marker.routes.js';

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

  // app.route('/api', detectRoutes);
  app.route('/api/markers', markerRoutes);
  app.get('/', (c) => {
    return c.json({ 
      message: 'G-16 API Server',
      version: '1.0.0',
      routes: [
        'GET /health',
        'GET /api/markers',
        'GET /api/markers/:id',
        'POST /api/markers',
        'PUT /api/markers/:id',
        'DELETE /api/markers/:id',
      ]
    });
  });
};

