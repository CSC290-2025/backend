import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import config from './config/env';
import { errorHandler } from '@/middlewares';
import { fcmRoutes, tokenRoutes } from '@/modules/emergency/routes';

const app = new Hono();

app.onError(errorHandler);
app.route('/notifications', fcmRoutes);
app.route('/tokens', tokenRoutes);

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
