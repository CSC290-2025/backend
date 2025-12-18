import type { OpenAPIHono } from '@hono/zod-openapi';
import { WeatherRatingSchemas } from '../schemas';
import * as WeatherRatingController from '../controllers/weather-rating.controller';

// Register every weather rating endpoint with OpenAPI metadata.
const setupWeatherRatingRoutes = (app: OpenAPIHono) => {
  app.openapi(
    WeatherRatingSchemas.listWeatherRatingsRoute,
    WeatherRatingController.listWeatherRatings
  );

  app.openapi(
    WeatherRatingSchemas.createWeatherRatingRoute,
    WeatherRatingController.createWeatherRating
  );

  app.openapi(
    WeatherRatingSchemas.getUserWeatherRatingRoute,
    WeatherRatingController.getUserWeatherRating
  );

  app.openapi(
    WeatherRatingSchemas.getAverageWeatherRatingsRoute,
    WeatherRatingController.getAverageWeatherRatings
  );

  app.openapi(
    WeatherRatingSchemas.deleteWeatherRatingsByDateRoute,
    WeatherRatingController.deleteWeatherRatingsByDate
  );

  app.openapi(
    WeatherRatingSchemas.deleteAllWeatherRatingsRoute,
    WeatherRatingController.deleteAllWeatherRatings
  );
};

export { setupWeatherRatingRoutes };
