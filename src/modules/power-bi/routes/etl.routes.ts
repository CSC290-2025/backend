import { Hono } from 'hono';
import { ETLController } from '../controllers';

const etlRoutes = new Hono();

// Extract all data (legacy endpoint)
etlRoutes.get('/', ETLController.getExtractedData);

// Extract data by category
etlRoutes.get('/extract/users', ETLController.getUserData);
etlRoutes.get('/extract/healthcare', ETLController.getHealthcareData);
etlRoutes.get('/extract/weather', ETLController.getWeatherData);
etlRoutes.get('/extract/waste', ETLController.getWasteData);
etlRoutes.get('/extract/integrations', ETLController.getTeamIntegrations);

// Weather data transformation and loading
etlRoutes.get('/transform', ETLController.transformWeatherData);
etlRoutes.get('/load', ETLController.loadWeatherDataToG7FBDB);

export { etlRoutes };
