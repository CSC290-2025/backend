export { patientRoutes } from './patient.routes';
export { bedRoutes } from './bed.routes';
export { facilityRoutes } from './facility.routes';
export { appointmentRoutes } from './appointment.routes';
export { prescriptionRoutes } from './prescription.routes';
export { ambulanceRoutes } from './ambulance.routes';
export { emergencyCallRoutes } from './emergency_call.routes';
export { paymentRoutes } from './payment.routes';
import { setupPatientRoutes } from './patient.openapi.routes';
import { setupBedRoutes } from './bed.openapi.routes';
import { setupFacilityRoutes } from './facility.openapi.routes';
import { setupAppointmentRoutes } from './appointment.openapi.routes';
import { setupPrescriptionRoutes } from './prescription.openapi.routes';
import { setupAmbulanceRoutes } from './ambulance.openapi.routes';
import { setupEmergencyCallRoutes } from './emergency_call.openapi.routes';
import { setupPaymentRoutes } from './payment.openapi.routes';
import { setupDoctorsRoutes } from './doctors.openapi.routes';
import { setupMedicineInventoryRoutes } from './medicine_inventory.openapi.routes';
import { setupDepartmentRoutes } from './department.openapi.routes';
import { setupAddressRoutes } from './address.openapi.routes';
import { setupAuthRoutes } from './auth.routes';
import { setupStaffRoutes } from './staff.routes';

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
  setupAuthRoutes as setupHealthcareAuthRoutes,
  setupStaffRoutes,
};
