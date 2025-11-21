import { ScbController } from '../controllers';
import { ScbSchemas } from '../schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupScbRoutes = (app: OpenAPIHono) => {
  app.openapi(ScbSchemas.createQrRoute, ScbController.createQrCode);
  app.openapi(ScbSchemas.paymentConfirmRoute, ScbController.paymentConfirm);
  app.openapi(ScbSchemas.verifyPaymentRoute, ScbController.verifyPayment);
};

export { setupScbRoutes };
