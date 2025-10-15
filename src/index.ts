import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import config from './config/env';
import { errorHandler } from './middlewares/error';
import { cleanAirRoutes } from './modules/clean-air';

const app = new Hono();

app.onError(errorHandler);

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.route('/api', cleanAirRoutes);

const server = serve(
  {
    fetch: app.fetch,
    port: config.port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
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
