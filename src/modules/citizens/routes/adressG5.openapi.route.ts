import type { OpenAPIHono } from '@hono/zod-openapi';
import { AddressSchemas } from '@/modules/citizens/schemas';
import { addressController } from '@/modules/citizens/controllers/addressG5.controller';

export const setupAddressRoutes = (app: OpenAPIHono) => {
  app.openapi(
    AddressSchemas.getUsersByDistrictRoute,
    addressController.getUsersByDistrict
  );
};
