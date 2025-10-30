// Financial module - main entry point

// Export types
export type * from './types';

// Export model
export { WalletModel } from './models';

// Export service functions for buss
export { WalletService } from './services';

// Export schemas
export { WalletSchemas } from './schemas';

// Export OpenAPI routes for  main app
export { setupWalletRoutes } from './routes';
