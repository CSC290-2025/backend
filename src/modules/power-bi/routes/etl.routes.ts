import { Hono } from 'hono';
import { ETLController } from '../controllers';

const etlRoutes = new Hono();

// Extract data by category
etlRoutes.get('/extract/users', ETLController.getUserData);
etlRoutes.get('/extract/healthcare', ETLController.getHealthcareData);
etlRoutes.get('/extract/weather', ETLController.getWeatherData);
etlRoutes.get('/extract/waste', ETLController.getWasteData);

// Transformation
etlRoutes.get('/transform/weather', ETLController.transformWeatherData);
etlRoutes.get('/transform/healthcare', ETLController.transformHealthcareData);

// Loading
etlRoutes.get('/load/weather', ETLController.loadWeatherDataToG7FBDB);
etlRoutes.get('/load/healthcare', ETLController.loadHealthcareDataToG7FBDB);

export { etlRoutes };
