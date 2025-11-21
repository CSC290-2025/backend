/**
 * Test data examples for Bed model
 * These examples align with the CreateBedData type and Prisma schema requirements
 */

// Example 1: Full bed data with all fields
export const testBedData1 = {
  facilityId: 1,
  bedNumber: 'SK1B1',
  bedType: 'D1',
  status: 'Avail',
  patientId: 10,
  admissionDate: new Date('2025-11-14T00:00:00.000Z'), // Full ISO-8601 DateTime
};

// Example 2: Bed data with date as ISO string (will be coerced by Zod)
export const testBedData2 = {
  facilityId: 1,
  bedNumber: 'SK1B1',
  bedType: 'D1',
  status: 'Avail',
  patientId: 10,
  admissionDate: '2025-11-14T00:00:00.000Z', // ISO-8601 DateTime string
};

// Example 3: Bed data with date as date string (will be coerced by Zod, then converted to Date in model)
export const testBedData3 = {
  facilityId: 1,
  bedNumber: 'SK1B1',
  bedType: 'D1',
  status: 'Avail',
  patientId: 10,
  admissionDate: '2025-11-14', // Date string (Zod will coerce, model will convert to Date)
};

// Example 4: Minimal bed data (only required fields)
export const testBedData4 = {
  facilityId: 1,
  bedNumber: 'ICU-001',
  bedType: 'ICU',
  status: 'Occupied',
};

// Example 5: Bed data without patient (available bed)
export const testBedData5 = {
  facilityId: 1,
  bedNumber: 'GEN-205',
  bedType: 'General',
  status: 'Available',
  admissionDate: null,
};

// Example 6: Bed data with different statuses
export const testBedData6 = {
  facilityId: 2,
  bedNumber: 'EMG-101',
  bedType: 'Emergency',
  status: 'Reserved',
  patientId: 5,
  admissionDate: new Date('2025-11-15T10:30:00.000Z'),
};

// Example 7: Bed data with future admission date
export const testBedData7 = {
  facilityId: 1,
  bedNumber: 'VIP-001',
  bedType: 'VIP',
  status: 'Reserved',
  patientId: 15,
  admissionDate: new Date('2025-12-01T08:00:00.000Z'),
};

// Example 8: Bed data with all nullable fields as null
export const testBedData8 = {
  facilityId: null,
  bedNumber: null,
  bedType: null,
  status: null,
  patientId: null,
  admissionDate: null,
};

/**
 * Valid test data formats for admissionDate:
 * - Date object: new Date('2025-11-14T00:00:00.000Z')
 * - ISO-8601 string: '2025-11-14T00:00:00.000Z' or '2025-11-14T00:00:00Z'
 * - Date string: '2025-11-14' (will be coerced by Zod and converted in model)
 * - null: null (for beds without admission date)
 *
 * Note: The model now properly converts admissionDate to a Date object
 * before passing to Prisma, which expects ISO-8601 DateTime format.
 */
