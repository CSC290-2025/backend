import type { OpenAPIHono } from '@hono/zod-openapi';
import { AppointmentSchemas } from '../schemas';
import { AppointmentController } from '../controllers';

const setupAppointmentRoutes = (app: OpenAPIHono) => {
  app.openapi(
    AppointmentSchemas.listAppointmentsRoute,
    AppointmentController.listAppointments
  );
  app.openapi(
    AppointmentSchemas.getAppointmentRoute,
    AppointmentController.getAppointment
  );
  app.openapi(
    AppointmentSchemas.createAppointmentRoute,
    AppointmentController.createAppointment
  );
  app.openapi(
    AppointmentSchemas.updateAppointmentRoute,
    AppointmentController.updateAppointment
  );
  app.openapi(
    AppointmentSchemas.deleteAppointmentRoute,
    AppointmentController.deleteAppointment
  );
};

export { setupAppointmentRoutes };
