import type { OpenAPIHono } from '@hono/zod-openapi';
import { ownerSchemas } from '@/modules/ApartmentListing/schemas';
import { ownerController } from '@/modules/ApartmentListing/controllers/index';

const setupAPTOwnerRoutes = (app: OpenAPIHono) => {
  app.openapi(
    ownerSchemas.getApartmentOwnerByApartmentIdRoute,
    ownerController.getApartmentOwnerByApartmentId
  );
  app.openapi(ownerSchemas.findUserByIdRoute, ownerController.getUserById);
};

export { setupAPTOwnerRoutes };
