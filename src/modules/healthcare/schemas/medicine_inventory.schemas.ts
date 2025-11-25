import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const MedicineInventorySchema = z.object({
  id: z.number().int(),
  facilityId: z.number().int().nullable(),
  medicineName: z.string().nullable(),
  stockQuantity: z.number().int().nullable(),
  unitPrice: z
    .string()
    .transform((val) => Number(val))
    .nullable(),
  isInStock: z.boolean().nullable(),
  createdAt: z.date().nullable(),
});

const CreateMedicineInventorySchema = z.object({
  facilityId: z.number().int().optional(),
  medicineName: z.string().optional(),
  stockQuantity: z.number().int().optional(),
  unitPrice: z.number().optional(),
  isInStock: z.boolean().optional(),
});

const UpdateMedicineInventorySchema = z.object({
  facilityId: z.number().int().optional(),
  medicineName: z.string().optional(),
  stockQuantity: z.number().int().optional(),
  unitPrice: z.number().optional(),
  isInStock: z.boolean().optional(),
});

const MedicineInventoryFilterSchema = z.object({
  facilityId: z.coerce.number().int().optional(),
  isInStock: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

const MedicineInventoryPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt', 'medicineName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedMedicineInventorySchema = z.object({
  medicineInventory: z.array(MedicineInventorySchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const MedicineInventoryListSchema = z.object({
  medicineInventory: z.array(MedicineInventorySchema),
});

const MedicineInventoryIdParam = z.object({
  id: z.coerce.number().int(),
});

const getMedicineInventoryRoute = createGetRoute({
  path: '/medicine-inventory/{id}',
  summary: 'Get medicine inventory by ID',
  responseSchema: MedicineInventorySchema,
  params: MedicineInventoryIdParam,
  tags: ['MedicineInventory'],
});

const createMedicineInventoryRoute = createPostRoute({
  path: '/medicine-inventory',
  summary: 'Create new medicine inventory',
  requestSchema: CreateMedicineInventorySchema,
  responseSchema: MedicineInventorySchema,
  tags: ['MedicineInventory'],
});

const updateMedicineInventoryRoute = createPutRoute({
  path: '/medicine-inventory/{id}',
  summary: 'Update medicine inventory',
  requestSchema: UpdateMedicineInventorySchema,
  responseSchema: MedicineInventorySchema,
  params: MedicineInventoryIdParam,
  tags: ['MedicineInventory'],
});

const deleteMedicineInventoryRoute = createDeleteRoute({
  path: '/medicine-inventory/{id}',
  summary: 'Delete medicine inventory',
  params: MedicineInventoryIdParam,
  tags: ['MedicineInventory'],
});

const listMedicineInventoryRoute = createGetRoute({
  path: '/medicine-inventory',
  summary: 'List medicine inventory with pagination and filters',
  responseSchema: PaginatedMedicineInventorySchema,
  query: z.object({
    ...MedicineInventoryFilterSchema.shape,
    ...MedicineInventoryPaginationSchema.shape,
  }),
  tags: ['MedicineInventory'],
});

export const MedicineInventorySchemas = {
  MedicineInventorySchema,
  CreateMedicineInventorySchema,
  UpdateMedicineInventorySchema,
  MedicineInventoryFilterSchema,
  MedicineInventoryPaginationSchema,
  PaginatedMedicineInventorySchema,
  MedicineInventoryListSchema,
  MedicineInventoryIdParam,
  getMedicineInventoryRoute,
  createMedicineInventoryRoute,
  updateMedicineInventoryRoute,
  deleteMedicineInventoryRoute,
  listMedicineInventoryRoute,
};
