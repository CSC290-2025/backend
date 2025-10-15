import { Hono } from 'hono';
import { ETLController } from '../controllers';

const etlRoutes = new Hono();

<<<<<<< HEAD
=======
// Extract all data (legacy endpoint)
etlRoutes.get('/', ETLController.getExtractedData);

>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
// Extract data by category
etlRoutes.get('/extract/users', ETLController.getUserData);
etlRoutes.get('/extract/healthcare', ETLController.getHealthcareData);
etlRoutes.get('/extract/weather', ETLController.getWeatherData);
etlRoutes.get('/extract/waste', ETLController.getWasteData);
etlRoutes.get('/extract/integrations', ETLController.getTeamIntegrations);

// Weather data transformation and loading
<<<<<<< HEAD
etlRoutes.get('/transform/weather', ETLController.transformWeatherData);
etlRoutes.get('/load/weather', ETLController.loadWeatherDataToG7FBDB);
=======
etlRoutes.get('/transform', ETLController.transformWeatherData);
etlRoutes.get('/load', ETLController.loadWeatherDataToG7FBDB);
>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)

export { etlRoutes };
