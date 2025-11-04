import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ETLController } from '../controllers';

const etlRoutes = new Hono();

// Allow frontend dev origin
etlRoutes.use('*', cors({ origin: '*' }));

// Extract data by category
etlRoutes.get('/extract/users', ETLController.getUserData);
etlRoutes.get('/extract/healthcare', ETLController.getHealthcareData);
etlRoutes.get('/extract/weather', ETLController.getWeatherData);
etlRoutes.get('/extract/waste', ETLController.getWasteData);

export { etlRoutes };
