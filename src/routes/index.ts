import type { OpenAPIHono } from '@hono/zod-openapi';

/* 
ROUTING OPTIONS:
Choose ONE approach per module that you're comfortable with:
  1. OpenAPI Routes - Documented in Swagger, type-safe with Zod
  2. Normal Hono Routes - Simple, no Swagger docs
*/

// Apartment
import { setupApartmentRoutes } from '@/modules/ApartmentListing';
import { setupRatingRoutes } from '@/modules/ApartmentListing';
import { setupRoomRoutes } from '@/modules/ApartmentListing';
import { setupAddressRoutes } from '@/modules/ApartmentListing';
import { setupUploadRoutes } from '@/modules/ApartmentListing';
import { setupBookingRoutes } from '@/modules/ApartmentListing';

// Clean Air
import { setupCleanAirRoutes } from '@/modules/clean-air/routes';

// Emergency
import {
  setupReportRoutes,
  setupFcmRoutes,
  setupTokenRoutes,
} from '@/modules/emergency';

// import { reportRoutes, fcmRoutes, tokenRoutes } from '@/modules/emergency';

// Event Hub
import { setupEventRoutes } from '@/modules/EventHub';
import { setupBookmarkRoutes } from '@/modules/EventHub';

// Financial
import {
  setupWalletRoutes,
  setupScbRoutes,
  setupMetroCardRoutes,
  setupInsuranceCardRoutes,
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

// Support Map
import { detectRoutes, markerRoutes } from '@/modules/G-16/routes';

// Volunteer
import { eventRoutes } from '../modules/Volunteer/routes';

// Waste
import { setupWasteRoutes } from '@/modules/waste-management/routes';

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

  //Emergency
  setupReportRoutes(app);
  setupFcmRoutes(app);
  setupTokenRoutes(app);

  // Event Hub
  setupEventRoutes(app);
  setupBookmarkRoutes(app);

  // Financial
  setupMetroCardRoutes(app);
  setupWalletRoutes(app);
  setupScbRoutes(app);
  setupInsuranceCardRoutes(app);

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

  // Waste
  setupWasteRoutes(app);

  /*
  ============================================
  Normal Hono Routes (not in Swagger docs)
  ============================================
  */
  //Emergency
  //   app.route('/reports', reportRoutes);
  //   app.route('/fcm', fcmRoutes);
  //   app.route('/tokens', tokenRoutes);
  //   app.route('/emergency', emergencyRoutes);

  // Power BI
  app.route('/reports', reportRoutes);

  // Support Map
  app.route('/api', detectRoutes);
  app.route('/api', markerRoutes);

  // Volunteer
  app.route('/api/v1/volunteer/', eventRoutes);
};
