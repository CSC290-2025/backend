import type { OpenAPIHono } from '@hono/zod-openapi';
import { WeatherOpenMeteoSchemas } from '../schemas';
import { OpenMeteoController } from '../controllers';

// Register external Open-Meteo proxy and import endpoints with OpenAPI.
const setupOpenMeteoRoutes = (app: OpenAPIHono) => {
  app.openapi(
    WeatherOpenMeteoSchemas.getExternalCurrentRoute,
    OpenMeteoController.getOpenMeteoCurrent
  );

  app.openapi(
    WeatherOpenMeteoSchemas.getExternalHourlyRoute,
    OpenMeteoController.getOpenMeteoHourly
  );

  app.openapi(
    WeatherOpenMeteoSchemas.getExternalDailyRoute,
    OpenMeteoController.getOpenMeteoDaily
  );

  app.openapi(
    WeatherOpenMeteoSchemas.importDailyRoute,
    OpenMeteoController.importDailyOpenMeteo
  );

  app.openapi(
    WeatherOpenMeteoSchemas.importDailyAllRoute,
    OpenMeteoController.importDailyOpenMeteoAll
  );
};

export { setupOpenMeteoRoutes };
