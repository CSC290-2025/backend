import { serve } from '@hono/node-server';
import config from '@/config/env';
import { errorHandler } from '@/middlewares/error';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { setupRoutes } from '@/routes';
import { cors } from 'hono/cors';

import prisma from '@/config/client';
import { startBookingCleanupJob } from '@/modules/ApartmentListing/models/bookingCleanup.model';
import { startAir4ThaiAggregationJob } from '@/modules/clean-air/services/clean-air-air4thai.scheduler';
import { startConsecutiveRainAlertJob } from '@/modules/weather/services/weather-rain-alert.scheduler';
import { enableWeatherAutoImport } from '@/modules/weather/services/weather-auto-import.scheduler';
import 'dotenv/config';

const app = new OpenAPIHono();
app.onError(errorHandler);

// CORS middleware - allow requests from frontend
app.use(
  cors({
    origin: (origin) => {
      if (config.isProduction) {
        return 'https://smartcity.sit.kmutt.ac.th';
      }
      return origin || 'http://localhost:5173';
    },
    allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
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

  const doc = app.getOpenAPIDocument({
    openapi: '3.0.0',
    info: {
      title: 'Smart City Hub',
      version: '1.0.0',
      description: 'A comprehensive API',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Local development server',
      },
    ],
  });

  return c.json(doc);
});

app.get('/swagger', swaggerUI({ url: '/doc' }));

setupRoutes(app);
startAir4ThaiAggregationJob();
startConsecutiveRainAlertJob();
enableWeatherAutoImport();

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
        console.log(`Server is running on http://localhost:${info.port}`);
        console.log(
          `API Documentation on http://localhost:${info.port}/swagger`
        );
        console.log(`OpenAPI Spec on http://localhost:${info.port}/doc`);

        // Start the booking cleanup job
        startBookingCleanupJob();
        console.log('Booking cleanup job started - will run every hour');
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
