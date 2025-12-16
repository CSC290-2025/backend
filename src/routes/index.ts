import type { OpenAPIHono } from '@hono/zod-openapi';

/*
ROUTING OPTIONS:
Choose ONE approach per module that you're comfortable with:
  1. OpenAPI Routes - Documented in Swagger, type-safe with Zod
  2. Normal Hono Routes - Simple, no Swagger docs
*/

// Auth
import { setupAuthRoutes } from '@/modules/Auth/routes';

// Apartment
import {
  setupApartmentRoutes,
  setupRatingRoutes,
  setupRoomRoutes,
  setupAddressRoutes,
  setupUploadRoutes,
  setupBookingRoutes,
  setupAPTOwnerRoutes,
} from '@/modules/ApartmentListing';

// Citizen
import {
  setupCitizenAddressRoutes,
  setupUserSpecialtyRoutes,
  setupUserG8Routes,
  setupRoleUserRoutes,
  setupUserRoutes,
  setupUserSpecialistRoutes,
} from '@/modules/citizens/routes';

// Clean Air
import { setupCleanAirRoutes } from '@/modules/clean-air/routes';

// Emergency
import {
  setupReportRoutes,
  setupFcmRoutes,
  setupTokenRoutes,
} from '@/modules/emergency';

import {
  reportRoutes,
  fcmRoutes,
  tokenRoutes,
  contactRoutes,
} from '@/modules/emergency';

// Event Hub
import { setupEventRoutes, setupBookmarkRoutes } from '@/modules/EventHub';

// Financial
import {
  setupWalletRoutes,
  setupScbRoutes,
  setupMetroCardRoutes,
  setupTransactionRoutes,
  setupInsuranceCardRoutes,
} from '@/modules/Financial';

// Free Cycle
import {
  setupFreecyclePostsRoutes,
  setupCategoryRoutes,
  setupFreecyclePostCategoriesPostRoutes,
  setupReceiverRequestsRoutes,
} from '@/modules/freecycle';

//Healthcare
import {
  setupPatientRoutes,
  setupBedRoutes,
  setupFacilityRoutes,
  setupAppointmentRoutes,
  setupPrescriptionRoutes,
  setupAmbulanceRoutes,
  setupEmergencyCallRoutes,
  setupPaymentRoutes,
  setupDoctorsRoutes,
  setupMedicineInventoryRoutes,
} from '@/modules/healthcare/routes';

// Know AI
import {
  setupEnrollmentRoutes,
  setupCourseRoutes,
  setupExerciseRoute,
  setupQuestionRoutes,
  setupLevelRoutes,
} from '@/modules/Know_AI/routes';

// Power BI
// import { reportRoutes } from '@/modules/power-bi';

// Support Map
import {
  detectRoutes,
  markerRoutes,
  distanceRoutes,
  markerTypeRoutes,
} from '@/modules/G-16/routes';

import { setupMarkerOpenApiRoutes } from '@/modules/G-16/routes/marker.openapi.routes';
import { setupMarkerTypeOpenApiRoutes } from '@/modules/G-16/routes/markerType.openapi.routes';

// Volunteer
import { eventRoutes, setupVolunteerRoutes } from '@/modules/Volunteer';

// Public Transportation
import { routeStopsRoutes } from '@/modules/public-transportation/routes';
import { transactionRoute } from '@/modules/public-transportation/routes';

// Waste
import { setupWasteRoutes } from '@/modules/waste-management/routes';

//Bin
import { setupBinRoutes } from '@/modules/waste-management/routes';

// Weather
import {
  setupWeatherRoutes,
  setupOpenMeteoRoutes,
  setupWeatherRatingRoutes,
} from '@/modules/weather/routes';

export const setupRoutes = (app: OpenAPIHono) => {
  /*
  ============================================
  OpenAPI Routes (documented in Swagger)
  ============================================
  */

  // Auth
  setupAuthRoutes(app);

  // Apartment
  setupAddressRoutes(app);
  setupApartmentRoutes(app);
  setupRoomRoutes(app);
  setupRatingRoutes(app);
  setupUploadRoutes(app);
  setupBookingRoutes(app);
  setupAPTOwnerRoutes(app);
  // Clean Air
  setupCleanAirRoutes(app);

  setupCitizenAddressRoutes(app);
  setupUserSpecialistRoutes(app);
  setupUserSpecialtyRoutes(app);
  setupUserG8Routes(app);
  setupRoleUserRoutes(app);
  setupUserRoutes(app);

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
  setupTransactionRoutes(app);
  setupInsuranceCardRoutes(app);
  setupScbRoutes(app);

  //Healthcare
  setupPatientRoutes(app);
  setupBedRoutes(app);
  setupFacilityRoutes(app);
  setupAppointmentRoutes(app);
  setupPrescriptionRoutes(app);
  setupAmbulanceRoutes(app);
  setupEmergencyCallRoutes(app);
  setupPaymentRoutes(app);
  setupDoctorsRoutes(app);
  setupMedicineInventoryRoutes(app);

  // Free Cycle
  setupFreecyclePostsRoutes(app);
  setupCategoryRoutes(app);
  setupFreecyclePostCategoriesPostRoutes(app);
  setupReceiverRequestsRoutes(app);

  // Know AI
  setupEnrollmentRoutes(app);
  setupCourseRoutes(app);
  setupExerciseRoute(app);
  setupQuestionRoutes(app);
  setupLevelRoutes(app);

  // Waste
  setupWasteRoutes(app);
  setupBinRoutes(app);

  // SupportMap
  setupMarkerOpenApiRoutes(app);
  setupMarkerTypeOpenApiRoutes(app);

  // SupportMap

  // Weather
  setupOpenMeteoRoutes(app);
  setupWeatherRatingRoutes(app);
  setupWeatherRoutes(app);

  // Volunteer
  setupVolunteerRoutes(app);

  /*
  ============================================
  Normal Hono Routes (not in Swagger docs)
  ============================================
  */
  //Emergency
  app.route('/emergency', reportRoutes());
  app.route('/emergency', contactRoutes());
  app.route('/emergency', fcmRoutes());

  // Power BI
  // app.route('/reports', reportRoutes);

  // Support Map
  app.route('/api', detectRoutes);
  app.route('/api', markerRoutes);
  app.route('/api', distanceRoutes);
  app.route('/api/marker-types', markerTypeRoutes);

  // Volunteer
  app.route('/api/v1/volunteer/', eventRoutes);

  // Public Transportation
  app.route('/api', routeStopsRoutes);
  app.route('/api', transactionRoute);
};
