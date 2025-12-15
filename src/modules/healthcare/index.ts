// Healthcare module - main entry point

// Export types (inferred from Zod schemas)
export type * from './types';

// Export model functions under a namespace for clarity
export * as PatientModel from './models';
export * as BedModel from './models/bed.model';
export * as FacilityModel from './models/facility.model';
export * as AppointmentModel from './models/appointment.model';
export * as PrescriptionModel from './models/prescription.model';
export * as AmbulanceModel from './models/ambulance.model';
export * as EmergencyCallModel from './models/emergency_call.model';
export * as PaymentModel from './models/payment.model';

// Export schemas for OpenAPI usage and validation
export {
  PatientSchemas,
  BedSchemas,
  FacilitySchemas,
  AppointmentSchemas,
  PrescriptionSchemas,
  AmbulanceSchemas,
  EmergencyCallSchemas,
  PaymentSchemas,
} from './schemas';

// Export routes (both normal Hono and OpenAPI variants)
export {
  patientRoutes,
  setupPatientRoutes,
  bedRoutes,
  setupBedRoutes,
  facilityRoutes,
  setupFacilityRoutes,
  appointmentRoutes,
  setupAppointmentRoutes,
  prescriptionRoutes,
  setupPrescriptionRoutes,
  ambulanceRoutes,
  setupAmbulanceRoutes,
  emergencyCallRoutes,
  setupEmergencyCallRoutes,
  paymentRoutes,
  setupPaymentRoutes,
} from './routes';
