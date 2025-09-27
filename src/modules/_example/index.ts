// Example module - main entry point

// Export types that other teams might need
export type * from './types';

// Export model functions for cross-module access
export { ProductModel } from './models';

// Export service functions for cross-module business logic
export { ProductService } from './services';

// Export routes for mounting in main app
export { productRoutes } from './routes';
