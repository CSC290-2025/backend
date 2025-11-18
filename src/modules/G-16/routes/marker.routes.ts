import { Hono } from 'hono';
import {
  createMarker,
  getAllMarkers,
  getMarkerById,
  updateMarker,
  deleteMarker,
} from '../controllers/marker.controller';

const markerRoutes = new Hono();
// markerRoutes.get('/markers', getAllMarkers); // /api/markers
markerRoutes.get('/markers', getAllMarkers); // /api/markers
markerRoutes.get('/markers/:id', getMarkerById);
markerRoutes.post('/api/markers', createMarker);
markerRoutes.put('/api/markers/:id', updateMarker);
markerRoutes.delete('/api/markers/:id', deleteMarker);
export { markerRoutes };
