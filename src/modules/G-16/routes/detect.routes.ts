import { Hono } from 'hono';
import { detectHarm } from '../controllers/detect.controller';

export const detectRoutes = new Hono();

detectRoutes.post('/detect-harm', detectHarm);
// detectRoutes.get('/ping', (c) => c.text('detect ok'));