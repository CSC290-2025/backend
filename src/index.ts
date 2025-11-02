import { serve } from '@hono/node-server';
import config from '@/config/env';
import { errorHandler } from '@/middlewares/error';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { setupRoutes } from '@/routes';
import { cors } from 'hono/cors';
import prisma from '@/config/client.ts';

const app = new OpenAPIHono();
app.onError(errorHandler);

app.use(
  '*',
  cors({
    origin: config.isProduction ? 'https://smartcity.sit.kmutt.ac.th' : '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.notFound((c) => {
  return c.json(
    {
      error: 'API Endpoint not found',
      status: 404,
      message: 'The resource you are looking for does not exist.',
    },
    404
  );
});

setupRoutes(app);

async function shutdown(server: ReturnType<typeof serve>) {
  console.log('Shutting down server...');
  try {
    server.close((err) => {
      if (err) console.error('Error closing server:', err);
    });
    await prisma.$disconnect();
    console.log('Prisma disconnected');
  } catch (err) {
    console.error('Error during shutdown:', err);
  } finally {
    process.exit(0);
  }
}

async function startServer(startPort: number) {
  let port = startPort;

  while (true) {
    try {
      const server = serve(
        {
          fetch: app.fetch,
          port,
        },
        (info) => {
          const actualPort = info.port;

          app.get('/', (c) => {
            return c.json({
              name: 'Smart City Hub API',
              version: '1.0.0',
              status: 'healthy',
              timestamp: new Date().toISOString(),
              docs: `http://localhost:${actualPort}/swagger`,
            });
          });

          app.doc('/doc', {
            openapi: '3.0.0',
            info: {
              version: '1.0.0',
              title: 'Smart City Hub',
              description: 'A comprehensive API',
            },
            servers: [
              {
                url: `http://localhost:${actualPort}`,
                description: 'Local development server',
              },
            ],
          });

          app.get('/swagger', swaggerUI({ url: '/doc' }));

          console.log(`Server is running on http://localhost:${actualPort}`);
          console.log(
            `API Documentation on http://localhost:${actualPort}/swagger`
          );
          console.log(`OpenAPI Spec on http://localhost:${actualPort}/doc`);
        }
      );

      process.on('SIGINT', () => shutdown(server));
      process.on('SIGTERM', () => shutdown(server));

      break; // Successfully started server
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is in use, trying next port...`);
        port++;
      } else {
        console.error('Server failed to start:', err);
        process.exit(1);
      }
    }
  }
}

startServer(config.port);
