import { Hono } from 'hono';
import { ETLController } from '../controllers';

const etlRoutes = new Hono();

// Extract data by category
etlRoutes.get('/extract/users', ETLController.getUserData);
etlRoutes.get('/extract/healthcare', ETLController.getHealthcareData);
etlRoutes.get('/extract/weather', ETLController.getWeatherData);
etlRoutes.get('/extract/waste', ETLController.getWasteData);
etlRoutes.get('/extract/integrations', ETLController.getTeamIntegrations);

// Weather data transformation and loading
etlRoutes.get('/transform/weather', ETLController.transformWeatherData);
etlRoutes.get('/load/weather', ETLController.loadWeatherDataToG7FBDB);

export { etlRoutes };
