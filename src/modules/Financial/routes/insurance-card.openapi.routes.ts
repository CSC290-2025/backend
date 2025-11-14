import { InsuranceCardSchemas } from '../schemas';
import { InsuranceCardController } from '../controllers';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupInsuranceCardRoutes = (app: OpenAPIHono) => {
  app.openapi(
    InsuranceCardSchemas.createInsuranceCardRoute,
    InsuranceCardController.createCard
  );
  app.openapi(
    InsuranceCardSchemas.getUserInsuranceCardRoute,
    InsuranceCardController.getUserCard
  );
  app.openapi(
    InsuranceCardSchemas.getInsuranceCardRoute,
    InsuranceCardController.getCard
  );
  app.openapi(
    InsuranceCardSchemas.topUpInsuranceCardRoute,
    InsuranceCardController.topUpCard
  );
};

export { setupInsuranceCardRoutes };
