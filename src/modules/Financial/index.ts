// Financial module - main entry point

// Export types
export type * from './types';

// Export model
export { WalletModel, InsuranceCardModel } from './models';

// Export service functions for buss
export { WalletService, InsuranceCardService } from './services';

// Export schemas
export { WalletSchemas, InsuranceCardSchemas } from './schemas';

// Export OpenAPI routes for  main app
export { setupWalletRoutes, setupInsuranceCardRoutes } from './routes';
