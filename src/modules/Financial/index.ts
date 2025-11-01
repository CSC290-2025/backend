// Financial module - main entry point

// Export types
export type * from './types';

// Export models
export { WalletModel, ScbModel } from './models';

// Export services
export { WalletService, ScbService } from './services';

// Export schemas for OpenAPI routes
export { WalletSchemas, ScbSchemas } from './schemas';

// Export OpenAPI routes for main app
export { setupWalletRoutes } from './routes';
