import type { OpenAPIHono } from '@hono/zod-openapi';
import { DoctorController } from '../controllers';
import { DoctorSchemas } from '../schemas';

const setupDoctorsRoutes = (app: OpenAPIHono) => {
  app.openapi(DoctorSchemas.listDoctorsRoute, DoctorController.listDoctors);
  app.openapi(DoctorSchemas.createDoctorRoute, DoctorController.createDoctor);
  app.openapi(DoctorSchemas.getDoctorRoute, DoctorController.getDoctor);
  app.openapi(DoctorSchemas.updateDoctorRoute, DoctorController.updateDoctor);
  app.openapi(DoctorSchemas.deleteDoctorRoute, DoctorController.deleteDoctor);
};

export { setupDoctorsRoutes };
