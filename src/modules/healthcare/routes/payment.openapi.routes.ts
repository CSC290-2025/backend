import type { OpenAPIHono } from '@hono/zod-openapi';
import { PaymentSchemas } from '../schemas';
import { PaymentController } from '../controllers';

const setupPaymentRoutes = (app: OpenAPIHono) => {
  app.openapi(PaymentSchemas.listPaymentsRoute, PaymentController.listPayments);
  app.openapi(PaymentSchemas.getPaymentRoute, PaymentController.getPayment);
  app.openapi(
    PaymentSchemas.createPaymentRoute,
    PaymentController.createPayment
  );
  app.openapi(
    PaymentSchemas.updatePaymentRoute,
    PaymentController.updatePayment
  );
  app.openapi(
    PaymentSchemas.deletePaymentRoute,
    PaymentController.deletePayment
  );
};

export { setupPaymentRoutes };
