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
  TransactionService,
} from './services';

// Export schemas for OpenAPI routes
export {
  WalletSchemas,
  MetroCardSchemas,
  InsuranceCardSchemas,
  ScbSchemas,
  TransactionSchemas,
} from './schemas';

// Export OpenAPI routes for main app
export {
  setupWalletRoutes,
  setupScbRoutes,
  setupMetroCardRoutes,
  setupInsuranceCardRoutes,
  setupTransactionRoutes,
  setupLocationRoutes,
} from './routes';
