import type { OpenAPIHono } from '@hono/zod-openapi';
import { WeatherSchemas } from '../schemas';
import * as WeatherController from '../controllers/weather.controller';

const setupWeatherRoutes = (app: OpenAPIHono) => {
  app.openapi(
    WeatherSchemas.listWeatherDataRoute,
    WeatherController.listWeather
  );

  app.openapi(WeatherSchemas.getWeatherDataRoute, WeatherController.getWeather);

  app.openapi(
    WeatherSchemas.createWeatherDataRoute,
    WeatherController.createWeather
  );

  app.openapi(
    WeatherSchemas.updateWeatherDataRoute,
    WeatherController.updateWeather
  );

  app.openapi(
    WeatherSchemas.deleteWeatherDataRoute,
    WeatherController.deleteWeather
  );

  app.openapi(
    WeatherSchemas.deleteAllWeatherDataRoute,
    WeatherController.deleteAllWeather
  );
};

export { setupWeatherRoutes };
