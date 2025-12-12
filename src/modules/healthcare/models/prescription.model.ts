import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import { Prisma } from '@/generated/prisma';
import type {
  Prescription,
  CreatePrescriptionData,
  UpdatePrescriptionData,
  PrescriptionFilterOptions,
  PrescriptionPaginationOptions,
  PaginatedPrescriptions,
} from '../types';

const prescriptionSelect = {
  id: true,
  patient_id: true,
  facility_id: true,
  status: true,
  medicines_list: true,
  total_amount: true,
  created_at: true,
} satisfies Prisma.prescriptionsSelect;

type PrescriptionRecord = Prisma.prescriptionsGetPayload<{
  select: typeof prescriptionSelect;
}>;

const mapPrescription = (record: PrescriptionRecord): Prescription => ({
  id: record.id,
  patientId: record.patient_id,
  facilityId: record.facility_id ?? null,
  status: record.status ?? null,
  medicinesList: record.medicines_list ?? null,
  totalAmount: record.total_amount ? Number(record.total_amount) : null,
  createdAt: record.created_at,
});

const normalizeStatus = (status?: string | null) =>
  (status ?? '').trim().toLowerCase();

const isDispensedStatus = (status?: string | null) =>
  normalizeStatus(status) === 'dispensed';

type MedicineListEntry = {
  medicineId?: unknown;
  name?: unknown;
  quantity?: unknown;
};

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const extractMedicineId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0)
    return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
};

const buildAdjustmentPlan = (medicinesList: unknown) => {
  const byId = new Map<number, number>();
  const byName = new Map<string, number>();

  if (!Array.isArray(medicinesList)) {
    return { byId, byName };
  }

  medicinesList.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const item = entry as MedicineListEntry;

    const quantity = asNumber(item.quantity);
    if (quantity === null || quantity <= 0) return;

    const medicineId = extractMedicineId(item.medicineId);
    if (medicineId !== null) {
      byId.set(medicineId, (byId.get(medicineId) ?? 0) + quantity);
      return;
    }

    const name =
      typeof item.name === 'string' ? item.name.trim().toLowerCase() : '';
    if (!name) return;

    byName.set(name, (byName.get(name) ?? 0) + quantity);
  });

  return { byId, byName };
};

const adjustInventoryForMedicines = async (
  tx: Prisma.TransactionClient,
  medicinesList: unknown
) => {
  const { byId, byName } = buildAdjustmentPlan(medicinesList);

  if (byId.size === 0 && byName.size === 0) return;

  for (const [id, quantity] of byId.entries()) {
    const inventoryItem = await tx.medicine_inventory.findUnique({
      where: { id },
      select: {
        id: true,
        stock_quantity: true,
        medicine_name: true,
      },
    });
    if (!inventoryItem) continue;

    const currentQty = inventoryItem.stock_quantity ?? 0;
    const nextQty = Math.max(0, currentQty - quantity);
    if (nextQty === currentQty) continue;

    await tx.medicine_inventory.update({
      where: { id },
      data: {
        stock_quantity: nextQty,
        is_in_stock: nextQty > 0,
      },
    });

    const normalizedName = inventoryItem.medicine_name
      ? inventoryItem.medicine_name.trim().toLowerCase()
      : '';
    if (normalizedName) {
      byName.delete(normalizedName);
    }
  }

  for (const [name, quantity] of byName.entries()) {
    const inventoryItem = await tx.medicine_inventory.findFirst({
      where: {
        medicine_name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        stock_quantity: true,
      },
    });

    if (!inventoryItem) continue;

    const currentQty = inventoryItem.stock_quantity ?? 0;
    const nextQty = Math.max(0, currentQty - quantity);
    if (nextQty === currentQty) continue;

    await tx.medicine_inventory.update({
      where: { id: inventoryItem.id },
      data: {
        stock_quantity: nextQty,
        is_in_stock: nextQty > 0,
      },
    });
  }
};

const shouldAdjustInventory = (
  previousStatus?: string | null,
  nextStatus?: string | null
) => isDispensedStatus(nextStatus) && !isDispensedStatus(previousStatus);

const buildWhereClause = (
  filters: PrescriptionFilterOptions = {}
): Prisma.prescriptionsWhereInput => {
  const where: Prisma.prescriptionsWhereInput = {};

  if (filters.patientId !== undefined) {
    where.patient_id = filters.patientId;
  }

  if (filters.facilityId !== undefined) {
    where.facility_id = filters.facilityId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  // Search removed as medication_name is not a column.
  // If search is needed, it would require JSON filtering or a different approach.

  return where;
};

const getOrderBy = (
  sortBy: PrescriptionPaginationOptions['sortBy'],
  sortOrder: PrescriptionPaginationOptions['sortOrder']
): Prisma.prescriptionsOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'createdAt':
    default:
      return { created_at: sortOrder };
  }
};

const findById = async (id: number): Promise<Prescription | null> => {
  try {
    const record = await prisma.prescriptions.findUnique({
      where: { id },
      select: prescriptionSelect,
    });

    return record ? mapPrescription(record) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMany = async (
  filters: PrescriptionFilterOptions = {}
): Promise<Prescription[]> => {
  try {
    const records = await prisma.prescriptions.findMany({
      where: buildWhereClause(filters),
      select: prescriptionSelect,
      orderBy: { created_at: 'desc' },
    });

    return records.map(mapPrescription);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: PrescriptionFilterOptions,
  pagination: PrescriptionPaginationOptions
): Promise<PaginatedPrescriptions> => {
  try {
    const { page, limit, sortBy, sortOrder } = pagination;
    const where = buildWhereClause(filters);
    const orderBy = getOrderBy(sortBy, sortOrder);

    const [records, total] = await Promise.all([
      prisma.prescriptions.findMany({
        where,
        select: prescriptionSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.prescriptions.count({ where }),
    ]);

    return {
      prescriptions: records.map(mapPrescription),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreatePrescriptionData): Promise<Prescription> => {
  try {
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.prescriptions.create({
        data: {
          patient_id: data.patientId,
          facility_id: data.facilityId ?? null,
          status: data.status ?? null,
          medicines_list: data.medicinesList ?? Prisma.JsonNull,
          total_amount: data.totalAmount ?? 0,
        },
        select: prescriptionSelect,
      });

      if (isDispensedStatus(created.status)) {
        await adjustInventoryForMedicines(tx, created.medicines_list);
      }

      return created;
    });

    return mapPrescription(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdatePrescriptionData
): Promise<Prescription> => {
  try {
    const record = await prisma.$transaction(async (tx) => {
      const previous = await tx.prescriptions.findUniqueOrThrow({
        where: { id },
        select: { status: true },
      });

      const updateData: Prisma.prescriptionsUncheckedUpdateInput = {};

      if (data.patientId !== undefined) {
        updateData.patient_id = data.patientId;
      }

      if (data.facilityId !== undefined) {
        updateData.facility_id = data.facilityId ?? null;
      }

      if (data.status !== undefined) {
        updateData.status = data.status ?? null;
      }

      if (data.medicinesList !== undefined) {
        updateData.medicines_list = data.medicinesList ?? Prisma.JsonNull;
      }

      if (data.totalAmount !== undefined) {
        updateData.total_amount = data.totalAmount;
      }

      const updated = await tx.prescriptions.update({
        where: { id },
        data: updateData,
        select: prescriptionSelect,
      });

      if (shouldAdjustInventory(previous.status, updated.status)) {
        await adjustInventoryForMedicines(tx, updated.medicines_list);
      }

      return updated;
    });

    return mapPrescription(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.prescriptions.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findById, findMany, findWithPagination, create, update, deleteById };
