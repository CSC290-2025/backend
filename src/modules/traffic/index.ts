export * from './types';

// Export schemas for OpenAPI
export { TrafficLightSchemas } from './schemas';
export { LightRequestSchemas } from './schemas';
export { VehicleSchemas } from './schemas';

// Export models for cross-module access
export { TrafficLightModel, LightRequestModel, VehicleModel } from './models';

// Export services for business logic
export {
  TrafficLightService,
  LightRequestService,
  VehicleService,
  GoogleMapsService,
  TimingService,
} from './services';

// Export route setup function
export { setupTrafficRoutes } from './routes/light-request.openapi.routes';
export { SetupMainTrafficRoutes } from './routes/traffic.openapi.routes';
export { setupTrafficEmergencyRoutes } from './routes/traffic_emergencies.routes';
export { setupRoadRoutes } from './routes/roads.routes';
