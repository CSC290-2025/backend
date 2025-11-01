// Financial module - main entry point

// Export types
export type * from './types';

// Export models
export { WalletModel, InsuranceCardModel, ScbModel } from './models';

// Export services
export { WalletService, InsuranceCardService, ScbService } from './services';

// Export schemas for OpenAPI routes
export { WalletSchemas, InsuranceCardSchemas, ScbSchemas } from './schemas';

// Export OpenAPI routes for main app
export { setupWalletRoutes, setupInsuranceCardRoutes } from './routes';
