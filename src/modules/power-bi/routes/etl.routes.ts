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

// Transformation
etlRoutes.get('/transform/weather', ETLController.transformWeatherData);
etlRoutes.get('/transform/healthcare', ETLController.transformHealthcareData);

// Loading
etlRoutes.get('/load/weather', ETLController.loadWeatherDataToG7FBDB);
etlRoutes.get('/load/healthcare', ETLController.loadHealthcareDataToG7FBDB);

// Reports (Power BI)
etlRoutes.get('/reports', ETLController.getReports);
etlRoutes.post('/reports', ETLController.createReport);

// Transformed data access (from Firebase)
etlRoutes.get('/data/weather', ETLController.getWeatherTransformedData);
etlRoutes.get('/data/healthcare', ETLController.getHealthcareTransformedData);

export { etlRoutes };
