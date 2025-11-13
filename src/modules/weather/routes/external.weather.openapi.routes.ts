import type { OpenAPIHono } from '@hono/zod-openapi';
import { ExternalWeatherSchemas } from '../schemas';
import { ExternalWeatherController } from '../controllers';

const setupExternalWeatherRoutes = (app: OpenAPIHono) => {
  app.openapi(
    ExternalWeatherSchemas.getExternalWeatherRoute,
    ExternalWeatherController.getExternalWeather
  );

  app.openapi(
    ExternalWeatherSchemas.importDailyRoute,
    ExternalWeatherController.importDaily
  );
};

export { setupExternalWeatherRoutes };
