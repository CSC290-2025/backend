import type { Context } from 'hono';
import { MedicineInventoryModel } from '../models';
import { MedicineInventorySchemas } from '../schemas';
import { successResponse } from '@/utils/response';
import { NotFoundError } from '@/errors';

export const getMedicineInventory = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const item = await MedicineInventoryModel.findById(id);

  if (!item) {
    throw new NotFoundError('Medicine inventory item not found');
  }

  return successResponse(c, item);
};

export const createMedicineInventory = async (c: Context) => {
  const body = await c.req.json();
  const data =
    MedicineInventorySchemas.CreateMedicineInventorySchema.parse(body);
  const item = await MedicineInventoryModel.create(data);
  return successResponse(c, item, 201);
};

export const updateMedicineInventory = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const data =
    MedicineInventorySchemas.UpdateMedicineInventorySchema.parse(body);
  const item = await MedicineInventoryModel.update(id, data);

  if (!item) {
    throw new NotFoundError('Medicine inventory item not found');
  }

  return successResponse(c, item);
};

export const deleteMedicineInventory = async (c: Context) => {
  const id = Number(c.req.param('id'));
  await MedicineInventoryModel.deleteById(id);
  return successResponse(c, {
    message: 'Medicine inventory item deleted successfully',
  });
};

export const listMedicineInventory = async (c: Context) => {
  const query = c.req.query();
  const filters =
    MedicineInventorySchemas.MedicineInventoryFilterSchema.parse(query);
  const pagination =
    MedicineInventorySchemas.MedicineInventoryPaginationSchema.parse(query);

  const result = await MedicineInventoryModel.findWithPagination(
    filters,
    pagination
  );
  return successResponse(c, result);
};
