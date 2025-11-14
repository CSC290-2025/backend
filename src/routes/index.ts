import type { OpenAPIHono } from '@hono/zod-openapi';
// import { detectRoutes } from '../modules/G-16/routes/detect.routes.js';
import markerRoutes from '../modules/G-16/routes/marker.routes.js';

/* 
ROUTING OPTIONS:
Choose ONE approach per module that you're comfortable with:
  1. OpenAPI Routes - Documented in Swagger, type-safe with Zod
  2. Normal Hono Routes - Simple, no Swagger docs
*/

// OpenAPI Routes (documented in Swagger)
<<<<<<< HEAD
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
=======

// Clean Air
import { setupCleanAirRoutes } from '../modules/clean-air/routes';

// Event Hub
import { setupEventRoutes } from '@/modules/EventHub';
import { setupBookmarkRoutes } from '@/modules/EventHub';

// Financial
import {
  setupWalletRoutes,
  setupScbRoutes,
  setupMetroCardRoutes,
} from '@/modules/Financial';

// Free Cycle
import {
  setupFreecyclePostsRoutes,
  setupCategoryRoutes,
  setupFreecyclePostCategoriesPostRoutes,
} from '@/modules/freecycle';

// Know AI
import {
  setupEnrollmentRoutes,
  setupCourseRoutes,
  setupOnsiteSessionRoutes,
  setupExerciseRoute,
  setupQuestionRoutes,
  setupLevelRoutes,
} from '@/modules/Know_AI/routes';

// Power BI
import { reportRoutes } from '@/modules/power-bi';

// Volunteer
import { eventRoutes } from '../modules/Volunteer/routes';

export const setupRoutes = (app: OpenAPIHono) => {
  /* 
  ============================================
  OpenAPI Routes (documented in Swagger)
  ============================================
  */

  // Clean Air
  setupCleanAirRoutes(app);

  // Event Hub
  setupEventRoutes(app);
  setupBookmarkRoutes(app);

  // Financial
  setupMetroCardRoutes(app);
  setupWalletRoutes(app);
  setupScbRoutes(app);

  // Free Cycle
  setupFreecyclePostsRoutes(app);
  setupCategoryRoutes(app);
  setupFreecyclePostCategoriesPostRoutes(app);

  // Know AI
  setupEnrollmentRoutes(app);
  setupCourseRoutes(app);
  setupOnsiteSessionRoutes(app);
  setupExerciseRoute(app);
  setupQuestionRoutes(app);
  setupLevelRoutes(app);

  /*
  ============================================
  Normal Hono Routes (not in Swagger docs)
  ============================================
  */

  // Power BI
  app.route('/reports', reportRoutes);

  // Volunteer
  app.route('/api/v1/volunteer/', eventRoutes);
>>>>>>> origin
};

