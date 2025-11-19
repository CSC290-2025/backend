import type { OpenAPIHono } from '@hono/zod-openapi';
import { FreecycleReceiverRequestSchemas } from '@/modules/freecycle/schemas';
import { ReceiverRequestsController } from '@/modules/freecycle/controllers';

const setupReceiverRequestsRoutes = (app: OpenAPIHono) => {
  app.openapi(
    FreecycleReceiverRequestSchemas.getAllRequestRoute,
    ReceiverRequestsController.getAllRequests
  );

  app.openapi(
    FreecycleReceiverRequestSchemas.getRequestByIdRoute,
    ReceiverRequestsController.getRequestById
  );

  app.openapi(
    FreecycleReceiverRequestSchemas.getUserRequestRoute,
    ReceiverRequestsController.getUserRequests
  );

  app.openapi(
    FreecycleReceiverRequestSchemas.getPostRequestRoute,
    ReceiverRequestsController.getPostRequests
  );

  app.openapi(
    FreecycleReceiverRequestSchemas.createRequestRoute,
    ReceiverRequestsController.createRequest
  );

  app.openapi(
    FreecycleReceiverRequestSchemas.deleteRequestRoute,
    ReceiverRequestsController.deleteRequest
  );

  app.openapi(
    FreecycleReceiverRequestSchemas.updateRequestStatusRoute,
    ReceiverRequestsController.updateRequestStatus
  );

  app.openapi(
    FreecycleReceiverRequestSchemas.getPostsByUserIdRoute,
    ReceiverRequestsController.getRequestsByUserId
  );
};

export { setupReceiverRequestsRoutes };
