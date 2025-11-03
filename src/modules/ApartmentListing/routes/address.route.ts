import { AddressSchemas } from '../schemas';
import * as addressController from '../controllers/address.Controller.ts';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupAddressRoutes = (app: OpenAPIHono) => {
  app.openapi(AddressSchemas.getAddressByID, addressController.getAddressByID);
  app.openapi(
    AddressSchemas.createAddressRoute,
    addressController.createAddress
  );
  app.openapi(
    AddressSchemas.updateAddressRoute,
    addressController.updateAddress
  );
  app.openapi(
    AddressSchemas.deleteAddressRoute,
    addressController.deleteAddress
  );
};
export { setupAddressRoutes };
