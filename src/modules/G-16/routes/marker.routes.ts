import { Hono } from 'hono';
// import { getMarkers } from '../controllers/marker.controller';
import {
  getAllMarkers,
  getMarkerById,
  getMarkersByBounds,
  createMarker,
  updateMarker,
  deleteMarker,
} from '@/modules/G-16/controllers/marker.controller';

const mark = new Hono();
// mark.get('/markers', getMarkers); // /api/markers
mark.get('/', getAllMarkers);
mark.get('/bounds', getMarkersByBounds);
mark.post('/', createMarker);
mark.get('/:id', getMarkerById);
mark.put('/:id', updateMarker);
mark.delete('/:id', deleteMarker);

export default mark;
