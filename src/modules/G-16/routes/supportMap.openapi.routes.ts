import type { OpenAPIHono } from '@hono/zod-openapi';
import type { Handler } from 'hono';
import * as Schemas from '../schema';
import { calculateDistance } from '../controllers/distance.controller';

export const setupSupportMapOpenApiRoutes = (app: OpenAPIHono) => {
  app.openapi(
    Schemas.SupportMap.calculateDistanceRoute,
    calculateDistance as unknown as Handler
  );
};
