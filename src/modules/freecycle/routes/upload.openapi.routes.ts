import type { OpenAPIHono } from '@hono/zod-openapi';
import { UploadSchemas } from '@/modules/freecycle/schemas';
import { UploadController } from '../controllers/upload.controller';

export const setupUploadFreecycleRoutes = (app: OpenAPIHono) => {
  app.openapi(UploadSchemas.uploadFileRoute, UploadController.uploadFile);
  app.openapi(UploadSchemas.deleteFileRoute, UploadController.deleteFile);
};
