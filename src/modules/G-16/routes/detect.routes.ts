import { Hono } from 'hono';
//import { detectHarmHandler } from '@/modules/_example/controllers/detect.controller';
import { detectHarm } from '../controllers/detect.controller';

export const detectRoutes = new Hono();

// POST /ai/detect-harm  (multipart/form-data; field: image)
detectRoutes.post('/detect-harm', detectHarm);
// detectRoutes.get('/ping', (c) => c.text('detect ok'));
