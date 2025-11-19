import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors'; 
import config from '@/config/env';
import { errorHandler } from '@/middlewares/error';
import { setupRoutes } from '@/routes';
import routeStopsRoutes from './modules/_example/routes/routeFinder.route';

const app = new OpenAPIHono();
app.use(
  cors({
    // อนุญาตให้ Frontend (Vite/React) ที่รันบน Localhost เข้าถึงได้
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000', 
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ],
    allowHeaders: ['Content-Type'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    maxAge: 600,
  })
);

// กำหนด Error handler
app.onError(errorHandler);

// กำหนด OpenAPI Documentation
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

// กำหนด Swagger UI เพื่อแสดงเอกสาร API
app.get('/swagger', swaggerUI({ url: '/doc' }));

// Health check route
app.get('/', (c) => {
  return c.json({
    name: 'Smart City Hub API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    docs: `http://localhost:${config.port}/swagger`,
  });
});

// เชื่อมโยง routes ที่เกี่ยวข้องกับ route stops
app.route('/api', routeStopsRoutes);

// เรียกใช้ฟังก์ชัน setupRoutes สำหรับการกำหนด routes อื่นๆ
setupRoutes(app);

// ตั้งค่าเซิร์ฟเวอร์
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

// การจัดการ Signal เมื่อโปรเซสได้รับคำสั่งหยุด
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