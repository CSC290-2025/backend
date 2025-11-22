import type { OpenAPIHono } from '@hono/zod-openapi';
import { PrescriptionSchemas } from '../schemas';
import { PrescriptionController } from '../controllers';

const setupPrescriptionRoutes = (app: OpenAPIHono) => {
  app.openapi(
    PrescriptionSchemas.listPrescriptionsRoute,
    PrescriptionController.listPrescriptions
  );
  app.openapi(
    PrescriptionSchemas.getPrescriptionRoute,
    PrescriptionController.getPrescription
  );
  app.openapi(
    PrescriptionSchemas.createPrescriptionRoute,
    PrescriptionController.createPrescription
  );
  app.openapi(
    PrescriptionSchemas.updatePrescriptionRoute,
    PrescriptionController.updatePrescription
  );
  app.openapi(
    PrescriptionSchemas.deletePrescriptionRoute,
    PrescriptionController.deletePrescription
  );
};

export { setupPrescriptionRoutes };
