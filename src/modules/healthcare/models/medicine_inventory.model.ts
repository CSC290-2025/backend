import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
import type {
  MedicineInventory,
  CreateMedicineInventoryData,
  UpdateMedicineInventoryData,
  MedicineInventoryFilterOptions,
  MedicineInventoryPaginationOptions,
  PaginatedMedicineInventory,
} from '../types';

const medicineInventorySelect = {
  id: true,
  facility_id: true,
  medicine_name: true,
  stock_quantity: true,
  unit_price: true,
  is_in_stock: true,
  created_at: true,
} satisfies Prisma.medicine_inventorySelect;

type MedicineInventoryRecord = Prisma.medicine_inventoryGetPayload<{
  select: typeof medicineInventorySelect;
}>;

const mapMedicineInventory = (
  record: MedicineInventoryRecord
): MedicineInventory => ({
  id: record.id,
  facilityId: record.facility_id ?? null,
  medicineName: record.medicine_name ?? null,
  stockQuantity: record.stock_quantity ?? null,
  unitPrice: record.unit_price ? Number(record.unit_price) : null,
  isInStock: record.is_in_stock ?? null,
  createdAt: record.created_at ?? null,
});

const buildWhereClause = (
  filters: MedicineInventoryFilterOptions = {}
): Prisma.medicine_inventoryWhereInput => {
  const where: Prisma.medicine_inventoryWhereInput = {};

  if (filters.facilityId !== undefined) {
    where.facility_id = filters.facilityId;
  }

  if (filters.isInStock !== undefined) {
    where.is_in_stock = filters.isInStock;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.medicine_name = {
        contains: searchTerm,
        mode: 'insensitive',
      };
    }
  }

  return where;
};

const getOrderBy = (
  sortBy: MedicineInventoryPaginationOptions['sortBy'],
  sortOrder: MedicineInventoryPaginationOptions['sortOrder']
): Prisma.medicine_inventoryOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'medicineName':
      return { medicine_name: sortOrder };
    case 'createdAt':
    default:
      return { created_at: sortOrder };
  }
};

const findById = async (id: number): Promise<MedicineInventory | null> => {
  try {
    const record = await prisma.medicine_inventory.findUnique({
      where: { id },
      select: medicineInventorySelect,
    });

    return record ? mapMedicineInventory(record) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMany = async (
  filters: MedicineInventoryFilterOptions = {}
): Promise<MedicineInventory[]> => {
  try {
    const records = await prisma.medicine_inventory.findMany({
      where: buildWhereClause(filters),
      select: medicineInventorySelect,
      orderBy: { created_at: 'desc' },
    });

    return records.map(mapMedicineInventory);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: MedicineInventoryFilterOptions,
  pagination: MedicineInventoryPaginationOptions
): Promise<PaginatedMedicineInventory> => {
  try {
    const { page, limit, sortBy, sortOrder } = pagination;
    const where = buildWhereClause(filters);
    const orderBy = getOrderBy(sortBy, sortOrder);

    const [records, total] = await Promise.all([
      prisma.medicine_inventory.findMany({
        where,
        select: medicineInventorySelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.medicine_inventory.count({ where }),
    ]);

    return {
      medicineInventory: records.map(mapMedicineInventory),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (
  data: CreateMedicineInventoryData
): Promise<MedicineInventory> => {
  try {
    const record = await prisma.medicine_inventory.create({
      data: {
        facility_id: data.facilityId,
        medicine_name: data.medicineName,
        stock_quantity: data.stockQuantity,
        unit_price: data.unitPrice,
        is_in_stock: data.isInStock,
      },
      select: medicineInventorySelect,
    });

    return mapMedicineInventory(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdateMedicineInventoryData
): Promise<MedicineInventory> => {
  try {
    const updateData: Prisma.medicine_inventoryUncheckedUpdateInput = {};

    if (data.facilityId !== undefined) updateData.facility_id = data.facilityId;
    if (data.medicineName !== undefined)
      updateData.medicine_name = data.medicineName;
    if (data.stockQuantity !== undefined)
      updateData.stock_quantity = data.stockQuantity;
    if (data.unitPrice !== undefined) updateData.unit_price = data.unitPrice;
    if (data.isInStock !== undefined) updateData.is_in_stock = data.isInStock;

    const record = await prisma.medicine_inventory.update({
      where: { id },
      data: updateData,
      select: medicineInventorySelect,
    });

    return mapMedicineInventory(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.medicine_inventory.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findById, findMany, findWithPagination, create, update, deleteById };
