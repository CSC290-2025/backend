import { Hono } from 'hono';
import { ETLController } from '../controllers';

const etlRoutes = new Hono();

etlRoutes.get('/', ETLController.getExtractedData);

export { etlRoutes };
