import type { OpenAPIHono } from '@hono/zod-openapi';

// Healthcare
import {
  setupPatientRoutes,
  setupBedRoutes,
  setupFacilityRoutes,
  setupAppointmentRoutes,
  setupPrescriptionRoutes,
  setupAmbulanceRoutes,
  setupEmergencyCallRoutes,
  setupPaymentRoutes,
} from '@/modules/healthcare/routes';

export const setupRoutes = (app: OpenAPIHono) => {
  /*
  ============================================
  OpenAPI Routes (documented in Swagger)
  ============================================
  */

  // Healthcare
  setupPatientRoutes(app);
  setupBedRoutes(app);
  setupFacilityRoutes(app);
  setupAppointmentRoutes(app);
  setupPrescriptionRoutes(app);
  setupAmbulanceRoutes(app);
  setupEmergencyCallRoutes(app);
  setupPaymentRoutes(app);
};
