import type { OpenAPIHono } from '@hono/zod-openapi';
import type { Handler } from 'hono';
import * as Schemas from '../schema';

import {
  getAllMarkers,
  getMarkerById,
  createMarker,
  updateMarker,
  deleteMarker,
} from '../controllers/marker.controller';

export const setupMarkerOpenApiRoutes = (app: OpenAPIHono) => {
  app.openapi(
    Schemas.Marker.getAllMarkersRoute,
    getAllMarkers as unknown as Handler
  );
  app.openapi(
    Schemas.Marker.getMarkerByIdRoute,
    getMarkerById as unknown as Handler
  );
  app.openapi(
    Schemas.Marker.createMarkerRoute,
    createMarker as unknown as Handler
  );
  app.openapi(
    Schemas.Marker.updateMarkerRoute,
    updateMarker as unknown as Handler
  );
  app.openapi(
    Schemas.Marker.deleteMarkerRoute,
    deleteMarker as unknown as Handler
  );
};
