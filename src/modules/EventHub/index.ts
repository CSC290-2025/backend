// Event Hub module - main entry point

// Export types
export type * from './types';

// Export model
export { BookmarkModel, EventModel } from './models';

// Export service functions for buss
export { BookmarkService, EventService } from './services';

// Export schemas
export { BookmarkSchemas, EventSchemas } from './schemas';

// Export OpenAPI routes for  main app
export { setupBookmarkRoutes, setupEventRoutes } from './routes';
