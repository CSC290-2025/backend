import { Hono } from 'hono';
import { getMarkers } from '../controllers/marker.controller';
// import { getMarkers } from '../controllers/marker.controller';

const mark = new Hono();
mark.get('/markers', getMarkers); // /api/markers
export default mark;
