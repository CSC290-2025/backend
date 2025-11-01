// Financial module - main entry point

// Export types
export type * from './types';

// Export models
export {
  WalletModel,
  MetroCardModel,
  InsuranceCardModel,
  ScbModel,
} from './models';

// Export services
export {
  WalletService,
  MetroCardService,
  InsuranceCardService,
  ScbService,
} from './services';

// Export schemas for OpenAPI routes
export {
  WalletSchemas,
  MetroCardSchemas,
  InsuranceCardSchemas,
  ScbSchemas,
} from './schemas';

// Export OpenAPI routes for main app
export {
  setupWalletRoutes,
  setupMetroCardRoutes,
  setupInsuranceCardRoutes,
} from './routes';
