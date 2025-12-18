import type { OpenAPIHono } from '@hono/zod-openapi';
import type { Handler } from 'hono';
import * as Schemas from '../schema';

import {
  createMarkerType,
  getAllMarkerTypes,
  getMarkerTypeById,
  updateMarkerType,
  deleteMarkerType,
  getMarkerTypesByType,
  getMarkerTypeByTypes,
  getMarkerTypesInBounds,
} from '../controllers/markerType.controller';

export const setupMarkerTypeOpenApiRoutes = (app: OpenAPIHono) => {
  app.openapi(
    Schemas.MarkerType.getAllMarkerTypesRoute,
    getAllMarkerTypes as unknown as Handler
  );
  app.openapi(
    Schemas.MarkerType.getMarkerTypeByIdRoute,
    getMarkerTypeById as unknown as Handler
  );
  app.openapi(
    Schemas.MarkerType.createMarkerTypeRoute,
    createMarkerType as unknown as Handler
  );
  app.openapi(
    Schemas.MarkerType.updateMarkerTypeRoute,
    updateMarkerType as unknown as Handler
  );
  app.openapi(
    Schemas.MarkerType.deleteMarkerTypeRoute,
    deleteMarkerType as unknown as Handler
  );
  app.openapi(
    Schemas.MarkerType.getMarkerTypesByTypeRoute,
    getMarkerTypesByType as unknown as Handler
  );

  app.openapi(
    Schemas.MarkerType.getMarkerTypeByTypesRoute,
    getMarkerTypeByTypes as unknown as Handler
  );

  app.openapi(
    Schemas.MarkerType.getMarkerTypesInBoundsRoute,
    getMarkerTypesInBounds as unknown as Handler
  );
};
