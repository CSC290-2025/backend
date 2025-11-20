import { Hono } from 'hono';
import {
  getAllMarkers,
  getMarkerById,
  createMarker,
  updateMarker,
  deleteMarker,
} from '../controllers/marker.controller';

const markerRoutes = new Hono();
markerRoutes.get('/markers', getAllMarkers); // /api/markers
markerRoutes.get('/markers/:id', getMarkerById);
markerRoutes.post('/markers', createMarker); // แบบเดิม ('/api/markers', createMarker)
markerRoutes.put('/markers/:id', updateMarker); // แบบเดิม ('/api/markers/:id', updateMarker)
markerRoutes.delete('/markers/:id', deleteMarker); // แบบเดิม  ('/api/markers/:id', deleteMarker)

export { markerRoutes };
