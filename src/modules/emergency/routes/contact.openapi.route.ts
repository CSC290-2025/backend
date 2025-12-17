import { ContactController } from '@/modules/emergency/controllers';
import type { OpenAPIHono } from '@hono/zod-openapi';
import { RouteSchemas } from '@/modules/emergency/schemas';

const setupContactRoutes = (app: OpenAPIHono) => {
  app.openapi(
    RouteSchemas.Contact.createContactRoute,
    ContactController.createContact
  );
  app.openapi(
    RouteSchemas.Contact.findContactByUserIdRoute,
    ContactController.findContactByUserId
  );
  app.openapi(
    RouteSchemas.Contact.updateContactByIdRoute,
    ContactController.updateContactById
  );
  app.openapi(
    RouteSchemas.Contact.deleteContactByIdRoute,
    ContactController.deleteContactById
  );
};

export { setupContactRoutes };
