// Healthcare module - main entry point

// Export types (inferred from Zod schemas)
export type * from './types';

// Export model functions under a namespace for clarity
export * as PatientModel from './models';

// Export schemas for OpenAPI usage and validation
export { PatientSchemas } from './schemas';

// Export routes (both normal Hono and OpenAPI variants)
export { patientRoutes, setupPatientRoutes } from './routes';
