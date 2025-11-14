import type { OpenAPIHono } from '@hono/zod-openapi';

/* 
ROUTING OPTIONS:
Choose ONE approach per module that you're comfortable with:
  1. OpenAPI Routes - Documented in Swagger, type-safe with Zod
  2. Normal Hono Routes - Simple, no Swagger docs
*/

// OpenAPI Routes (documented in Swagger)

// Clean Air
import { setupCleanAirRoutes } from '../modules/clean-air/routes';

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

  // Volunteer
  app.route('/api/v1/volunteer/', eventRoutes);
};
