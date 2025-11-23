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
    const record = await prisma.prescriptions.create({
      data: {
        patient_id: data.patientId,
        facility_id: data.facilityId ?? null,
        status: data.status ?? null,
        medicines_list: data.medicinesList ?? Prisma.JsonNull,
        total_amount: data.totalAmount ?? 0,
      },
      select: prescriptionSelect,
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

    const record = await prisma.prescriptions.update({
      where: { id },
      data: updateData,
      select: prescriptionSelect,
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
