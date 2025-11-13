import type { OpenAPIHono } from '@hono/zod-openapi';
import {
  setupWeatherRoutes,
  setupOpenMeteoRoutes,
} from '@/modules/weather/routes';

export const setupRoutes = (app: OpenAPIHono) => {
  setupOpenMeteoRoutes(app);
  setupWeatherRoutes(app);
};
