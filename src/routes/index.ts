import type { OpenAPIHono } from '@hono/zod-openapi';
import {
  setupWeatherRoutes,
  setupExternalWeatherRoutes,
} from '@/modules/weather/routes';

export const setupRoutes = (app: OpenAPIHono) => {
  setupExternalWeatherRoutes(app);
  setupWeatherRoutes(app);
};
