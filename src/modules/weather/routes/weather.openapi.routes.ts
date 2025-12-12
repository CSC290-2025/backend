import type { OpenAPIHono } from '@hono/zod-openapi';
import { WeatherSchemas } from '../schemas';
import * as WeatherController from '../controllers/weather.controller';

// Register every weather DB route with OpenAPI metadata.
const setupWeatherRoutes = (app: OpenAPIHono) => {
  app.openapi(
    WeatherSchemas.listWeatherDataRoute,
    WeatherController.listWeather
  );

  app.openapi(
    WeatherSchemas.getWeatherDataRoute,
    WeatherController.getWeatherByDate
  );

  app.openapi(
    WeatherSchemas.getWeatherByLocationRoute,
    WeatherController.getWeatherByLocation
  );

  app.openapi(
    WeatherSchemas.listWeatherByRangeRoute,
    WeatherController.listWeatherByDateRange
  );

  app.openapi(
    WeatherSchemas.deleteWeatherDataRoute,
    WeatherController.deleteWeatherByDate
  );

  app.openapi(
    WeatherSchemas.deleteAllWeatherDataRoute,
    WeatherController.deleteAllWeather
  );
};

export { setupWeatherRoutes };
