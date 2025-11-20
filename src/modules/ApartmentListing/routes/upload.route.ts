import * as uploadController from '../controllers/upload.controller';
import type { OpenAPIHono } from '@hono/zod-openapi';
import { uploadSchemas } from '../schemas';

const setupUploadRoutes = (app: OpenAPIHono) => {
  app.openapi(
    uploadSchemas.getPictureById,
    uploadController.getPictureByIdController
  );
  app.openapi(
    uploadSchemas.getPicturesByApartmentId,
    uploadController.getPicturesByApartmentIdController
  );
  app.openapi(
    uploadSchemas.uploadFileRoute,
    uploadController.uploadFileController
  );
  app.openapi(
    uploadSchemas.deleteFileRoute,
    uploadController.deleteFileController
  );
};

export { setupUploadRoutes };
