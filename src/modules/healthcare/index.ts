// Healthcare module - main entry point

// Export types (inferred from Zod schemas)
export type * from './types';

// Export model functions under a namespace for clarity
export * as PatientModel from './models';
export * as BedModel from './models/bed.model';

// Export schemas for OpenAPI usage and validation
export { PatientSchemas, BedSchemas } from './schemas';

// Export routes (both normal Hono and OpenAPI variants)
export {
  patientRoutes,
  setupPatientRoutes,
  bedRoutes,
  setupBedRoutes,
} from './routes';
