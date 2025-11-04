import { serve } from '@hono/node-server';
import config from '@/config/env';
import { errorHandler } from '@/middlewares/error';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { setupRoutes } from '@/routes';
import { cors } from 'hono/cors';
import prisma from '@/config/client';
import { startNgrok } from '@/modules/Financial/utils/ngrok';

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

app.get('/', (c) => {
  return c.json({
    name: 'Smart City Hub API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    docs: `/swagger`,
  });
});

app.get('/doc', (c) => {
  let port = config.port;
  const addr = serverInstance?.address();

  if (addr && typeof addr !== 'string') {
    port = addr.port;
  }

  // Use public APP_URL when available so Swagger uses correct scheme (http/https)
  const docServerUrl = process.env.APP_URL ?? `http://localhost:${port}`;

  const doc = app.getOpenAPIDocument({
    openapi: '3.0.0',
    info: {
      title: 'Smart City Hub',
      version: '1.0.0',
      description: 'A comprehensive API',
    },
    servers: [
      {
        url: docServerUrl,
        description: 'Local development server',
      },
    ],
  });

  return c.json(doc);
});

app.get('/swagger', swaggerUI({ url: '/doc' }));

setupRoutes(app);

let serverInstance: ReturnType<typeof serve> | null = null;

async function shutdown() {
  console.log('Shutting down server...');
  try {
    if (serverInstance) {
      serverInstance.close((err) => {
        if (err) console.error('Error closing server:', err);
      });
    }
    await prisma.$disconnect();
    console.log('Prisma disconnected');
  } catch (err) {
    console.error('Error during shutdown:', err);
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());

async function startServer(startPort: number, maxRetries = 10) {
  let port = startPort;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      serverInstance = serve({ fetch: app.fetch, port }, (info) => {
        const publicUrl =
          process.env.APP_URL ?? `http://localhost:${info.port}`;
        console.log(`Server is running on http://localhost:${info.port}`);
        console.log(`Public URL (if set): ${process.env.APP_URL ?? 'none'}`);
        console.log(`API Documentation on ${publicUrl}/swagger`);
        console.log(`OpenAPI Spec on ${publicUrl}/doc`);

        // Start ngrok in development mode (only meant to run in a branch for Github codespace)
        if (!config.isProduction && process.env.G11_NGROK_AUTH_TOKEN) {
          startNgrok(info.port, process.env.G11_NGROK_AUTH_TOKEN);
        }
      });

      return;
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: unknown }).code === 'EADDRINUSE'
      ) {
        console.warn(`Port ${port} is in use, trying next port...`);
        port++;
      } else {
        console.error('Server failed to start:', err);
        process.exit(1);
      }
    }
  }

  console.error(`Failed to start server after ${maxRetries} attempts.`);
  process.exit(1);
}

startServer(config.port);
