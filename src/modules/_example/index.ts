// Example module - main entry point

// Export types that other teams might need
// Note: You can define types manually OR infer them from Zod schemas
// - Manual types: See ./types (current approach in this example)
// - Infer from schemas: Use z.infer<typeof Schema> (recommended for OpenAPI)
export type * from './types';

// Export model functions for cross-module access
export { ProductModel } from './models';

// Export service functions for cross-module business logic
export { ProductService } from './services';

// Export schemas for OpenAPI routes (only if using OpenAPI approach)
// Tip: You can also use schemas for validation in normal Hono routes
export { ProductSchemas } from './schemas';

// Export routes for mounting in main app
// Note: Choose ONE routing approach that you're comfortable with
// - productRoutes: Normal Hono routes (simple, no Swagger docs)
// - setupProductRoutes: OpenAPI routes (documented in Swagger)
export { productRoutes, setupProductRoutes } from './routes';
