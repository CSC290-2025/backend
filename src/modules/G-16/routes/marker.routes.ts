import { Hono } from 'hono';
import { getAllMarkers } from '../controllers/marker.controller';

const markerRoutes = new Hono();
markerRoutes.get('/markers', getAllMarkers); // /api/markers
export { markerRoutes };
