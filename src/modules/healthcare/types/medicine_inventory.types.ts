import type { z } from 'zod';
import type { MedicineInventorySchemas } from '../schemas';

type MedicineInventory = z.infer<
  typeof MedicineInventorySchemas.MedicineInventorySchema
>;
type CreateMedicineInventoryData = z.infer<
  typeof MedicineInventorySchemas.CreateMedicineInventorySchema
>;
type UpdateMedicineInventoryData = z.infer<
  typeof MedicineInventorySchemas.UpdateMedicineInventorySchema
>;
type MedicineInventoryFilterOptions = z.infer<
  typeof MedicineInventorySchemas.MedicineInventoryFilterSchema
>;
type MedicineInventoryPaginationOptions = z.infer<
  typeof MedicineInventorySchemas.MedicineInventoryPaginationSchema
>;
type PaginatedMedicineInventory = z.infer<
  typeof MedicineInventorySchemas.PaginatedMedicineInventorySchema
>;

export type {
  MedicineInventory,
  CreateMedicineInventoryData,
  UpdateMedicineInventoryData,
  MedicineInventoryFilterOptions,
  MedicineInventoryPaginationOptions,
  PaginatedMedicineInventory,
};
