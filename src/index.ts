import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import config from '@/config/env';
import { errorHandler } from '@/middlewares/error';
import { setupRoutes } from '@/modules/emergency/routes';

const app = new OpenAPIHono();

// Global middlewares
app.onError(errorHandler);
app.use(
  '*',
  cors({
    origin: `http://localhost:5173`,
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// OpenAPI doc (served JSON)
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Smart City Hub',
    description: 'A comprehensive API',
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Local development server',
    },
  ],
});

// Swagger UI
app.get('/swagger', swaggerUI({ url: '/doc' }));

// Root health/info
app.get('/', (c) =>
  c.json({
    name: 'Smart City Hub API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    docs: `http://localhost:${config.port}/swagger`,
  })
);

// Mount all routes (OpenAPI + normal Hono)
setupRoutes(app);

const server = serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
  console.log(`API Documentation on http://localhost:${info.port}/swagger`);
  console.log(`OpenAPI Spec on http://localhost:${info.port}/doc`);
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
