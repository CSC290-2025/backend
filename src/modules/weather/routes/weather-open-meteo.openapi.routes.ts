import type { OpenAPIHono } from '@hono/zod-openapi';
import { WeatherOpenMeteoSchemas } from '../schemas';
import { OpenMeteoController } from '../controllers';

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
};

export { setupOpenMeteoRoutes };
