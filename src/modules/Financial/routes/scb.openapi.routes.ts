import { ScbController } from '../controllers';
import { ScbSchemas } from '../schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupScbRoutes = (app: OpenAPIHono) => {
  app.openapi(ScbSchemas.createQrRoute, ScbController.createQrCode);
  app.openapi(ScbSchemas.webhookRoute, ScbController.handleWebhook);
  app.openapi(ScbSchemas.confirmQrPayment, ScbController.confirmQrPayment);
};

export { setupScbRoutes };
