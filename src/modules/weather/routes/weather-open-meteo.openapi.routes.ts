import type { OpenAPIHono } from '@hono/zod-openapi';
import { WeatherOpenMeteoSchemas } from '../schemas';
import { OpenMeteoController } from '../controllers';

const setupOpenMeteoRoutes = (app: OpenAPIHono) => {
  app.openapi(
    WeatherOpenMeteoSchemas.getExternalWeatherRoute,
    OpenMeteoController.getOpenMeteoWeather
  );

  app.openapi(
    WeatherOpenMeteoSchemas.importDailyRoute,
    OpenMeteoController.importDailyOpenMeteo
  );
};

export { setupOpenMeteoRoutes };
