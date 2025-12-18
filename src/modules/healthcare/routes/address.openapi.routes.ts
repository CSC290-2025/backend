import type { OpenAPIHono } from '@hono/zod-openapi';
import { AddressSchemas } from '../schemas';
import { AddressController } from '../controllers';

const setupAddressRoutes = (app: OpenAPIHono) => {
  app.openapi(
    AddressSchemas.listAddressesRoute,
    AddressController.listAddresses
  );
};

export { setupAddressRoutes };
