import { Hono } from 'hono';
import { getMarkers } from '../controllers/marker.controller';

const markerRoutes = new Hono();
markerRoutes.get('/markers', getMarkers); // /api/markers
export { markerRoutes };
