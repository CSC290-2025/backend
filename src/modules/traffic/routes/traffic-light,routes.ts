// source/traffic/routes/traffic-light.routes.ts
import { Hono } from 'hono';
import { TrafficLightController, LightRequestController } from '../controllers';

const trafficLightRoutes = new Hono();

// Main CRUD operations
trafficLightRoutes.get('/:id', TrafficLightController.getTrafficLight);
trafficLightRoutes.post('/', TrafficLightController.createTrafficLight);
trafficLightRoutes.put('/:id', TrafficLightController.updateTrafficLight);
trafficLightRoutes.delete('/:id', TrafficLightController.deleteTrafficLight);
trafficLightRoutes.get('/', TrafficLightController.listTrafficLights);

// Intersection-specific
trafficLightRoutes.get(
  '/intersection/:intersection_id',
  TrafficLightController.getTrafficLightsByIntersection
);
trafficLightRoutes.get(
  '/intersection/:intersection_id/timing',
  TrafficLightController.getIntersectionTiming
);

// Road-specific
trafficLightRoutes.get(
  '/road/:road_id',
  TrafficLightController.getTrafficLightsByRoad
);

// Traffic density and timing
trafficLightRoutes.get('/:id/density', TrafficLightController.calculateDensity);
trafficLightRoutes.post('/:id/timing', TrafficLightController.updateTiming);
trafficLightRoutes.post('/:id/color', TrafficLightController.updateColor);

/* Light requests
const lightRequestRoutes = new Hono();

lightRequestRoutes.get('/:id', LightRequestController.getLightRequest);
lightRequestRoutes.post('/', LightRequestController.createLightRequest);
lightRequestRoutes.get(
  '/traffic-light/:traffic_light_id',
  LightRequestController.getLightRequestsByTrafficLight
);
lightRequestRoutes.get('/recent', LightRequestController.getRecentLightRequests);
lightRequestRoutes.post('/:id/process', LightRequestController.processLightRequest);*/

export { trafficLightRoutes };
