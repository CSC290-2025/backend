import { EnrollmentController } from '@/modules/Know_AI/controllers';
import { EnrollmentSchema } from '@/modules/Know_AI/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupEnrollmentRoutes = (app: OpenAPIHono) => {
  app.openapi(
    EnrollmentSchema.createEnrollmentRoute,
    EnrollmentController.createEnrollment
  );
  app.openapi(
    EnrollmentSchema.getEnrollment,
    EnrollmentController.getEnrollment
  );
};

export { setupEnrollmentRoutes };
