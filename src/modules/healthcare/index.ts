// Healthcare module - main entry point

// Export types (inferred from Zod schemas)
export type * from './types';

// Export model functions under a namespace for clarity
export * as PatientModel from './models';
export * as BedModel from './models/bed.model';
export * as FacilityModel from './models/facility.model';
export * as AddressModel from './models/address.model';
export * as AppointmentModel from './models/appointment.model';
export * as PrescriptionModel from './models/prescription.model';
export * as AmbulanceModel from './models/ambulance.model';
export * as EmergencyCallModel from './models/emergency_call.model';
export * as PaymentModel from './models/payment.model';
export * as DoctorModel from './models/doctors.model';
export * as MedicineInventoryModel from './models/medicine_inventory.model';
export * as DepartmentModel from './models/department.model';

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
  DoctorSchemas,
  MedicineInventorySchemas,
  DepartmentSchemas,
  AddressSchemas,
} from './schemas';

// Export routes (OpenAPI setup functions)
export {
  setupPatientRoutes,
  setupBedRoutes,
  setupFacilityRoutes,
  setupAppointmentRoutes,
  setupPrescriptionRoutes,
  setupAmbulanceRoutes,
  setupEmergencyCallRoutes,
  setupPaymentRoutes,
  setupDoctorsRoutes,
  setupMedicineInventoryRoutes,
  setupDepartmentRoutes,
  setupAddressRoutes,
} from './routes';
