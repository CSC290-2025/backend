import { InsuranceCardSchemas } from '../schemas';
import { InsuranceCardController } from '../controllers';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupInsuranceCardRoutes = (app: OpenAPIHono) => {
  app.openapi(
    InsuranceCardSchemas.createInsuranceCardRoute,
    InsuranceCardController.createCard
  );
  app.openapi(
    InsuranceCardSchemas.getMeInsuranceCardsRoute,
    InsuranceCardController.getMyCards
  );
  app.openapi(
    InsuranceCardSchemas.getInsuranceCardRoute,
    InsuranceCardController.getInsuranceCard
  );
  app.openapi(
    InsuranceCardSchemas.topUpInsuranceCardRoute,
    InsuranceCardController.topUpCard
  );
  app.openapi(
    InsuranceCardSchemas.getUserInsuranceCardsRoute,
    InsuranceCardController.getUserInsuranceCards
  );
  app.openapi(
    InsuranceCardSchemas.updateInsuranceCardRoute,
    InsuranceCardController.updateInsuranceCard
  );
};

export { setupInsuranceCardRoutes };
