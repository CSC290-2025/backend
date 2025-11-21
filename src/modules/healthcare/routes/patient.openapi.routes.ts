import type { OpenAPIHono } from '@hono/zod-openapi';
import { PatientSchemas } from '../schemas';
import { PatientController } from '../controllers';

const setupPatientRoutes = (app: OpenAPIHono) => {
  app.openapi(PatientSchemas.listPatientsRoute, PatientController.listPatients);
  app.openapi(PatientSchemas.getPatientRoute, PatientController.getPatient);
  app.openapi(
    PatientSchemas.createPatientRoute,
    PatientController.createPatient
  );
  app.openapi(
    PatientSchemas.updatePatientRoute,
    PatientController.updatePatient
  );
  app.openapi(
    PatientSchemas.deletePatientRoute,
    PatientController.deletePatient
  );
};

export { setupPatientRoutes };
