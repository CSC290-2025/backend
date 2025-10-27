import { serve } from '@hono/node-server';
// import { Hono } from 'hono';
import config from '@/config/env';
import { errorHandler } from '@/middlewares/error';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { setupRoutes } from '@/routes';
import { cleanAirRoutes } from './modules/clean-air';
// const app = new Hono();
const app = new OpenAPIHono();

app.onError(errorHandler);

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
    // can add live api server after
  ],
});

app.route('/clean-air', cleanAirRoutes);
app.get('/swagger', swaggerUI({ url: '/doc' }));

app.get('/', (c) => {
  return c.json({
    name: 'Smart City Hub API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    docs: `http://localhost:${config.port}/swagger`,
  });
});

setupRoutes(app);

const server = serve(
  {
    fetch: app.fetch,
    port: config.port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
    console.log(`API Documentation on http://localhost:${info.port}/swagger`);
    console.log(`OpenAPI Spec on http://localhost:${info.port}/doc`);
  }
);

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
