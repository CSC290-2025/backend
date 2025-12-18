import { Hono, type Context } from 'hono';
import {
  createMarkerType,
  getAllMarkerTypes,
  getMarkerTypeById,
  getMarkerTypeByTypes,
  getMarkerTypesByType,
  getMarkerTypesInBounds,
  updateMarkerType,
  deleteMarkerType,
} from '../controllers/markerType.controller';
import * as markerTypeController from '../controllers';
import type { BlankEnv, BlankInput } from 'hono/types';
const markerTypeRoutes = new Hono();

// markerTypeRoutes.get('/type/:markerTypeId', getMarkerTypesByType);
// markerTypeRoutes.post('/filter', getMarkerTypeByTypes);
// markerTypeRoutes.post('/bounds', getMarkerTypesInBounds);

// markerTypeRoutes.get('/', getAllMarkerTypes);
// markerTypeRoutes.post('/', createMarkerType);
// markerTypeRoutes.get('/:id', getMarkerTypeById);
// markerTypeRoutes.put('/:id', updateMarkerType);
// markerTypeRoutes.delete('/:id', deleteMarkerType);

markerTypeRoutes.post('/', createMarkerType);
markerTypeRoutes.get('/', getAllMarkerTypes); //
markerTypeRoutes.post('/filter', getMarkerTypeByTypes); //
markerTypeRoutes.post('/bounds', getMarkerTypesInBounds);

markerTypeRoutes.get('/type/:markerTypeId', getMarkerTypesByType);

markerTypeRoutes.get('/:id', getMarkerTypeById);
markerTypeRoutes.put('/:id', updateMarkerType);
markerTypeRoutes.delete('/:id', deleteMarkerType);

export { markerTypeRoutes };
