import { Hono } from 'hono';
import { ETLController } from '../controllers';

const etlRoutes = new Hono();

etlRoutes.get('/', ETLController.getExtractedData);
etlRoutes.get('/transform', ETLController.transformWeatherData);

export { etlRoutes };
