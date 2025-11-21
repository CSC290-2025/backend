import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
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
  prescriber_user_id: true,
  facility_id: true,
  medication_name: true,
  quantity: true,
  status: true,
  created_at: true,
} satisfies Prisma.prescriptionsSelect;

type PrescriptionRecord = Prisma.prescriptionsGetPayload<{
  select: typeof prescriptionSelect;
}>;

const mapPrescription = (record: PrescriptionRecord): Prescription => ({
  id: record.id,
  patientId: record.patient_id,
  prescriberUserId: record.prescriber_user_id,
  facilityId: record.facility_id ?? null,
  medicationName: record.medication_name,
  quantity: record.quantity,
  status: record.status ?? null,
  createdAt: record.created_at,
});

const buildWhereClause = (
  filters: PrescriptionFilterOptions = {}
): Prisma.prescriptionsWhereInput => {
  const where: Prisma.prescriptionsWhereInput = {};

  if (filters.patientId !== undefined) {
    where.patient_id = filters.patientId;
  }

  if (filters.prescriberUserId !== undefined) {
    where.prescriber_user_id = filters.prescriberUserId;
  }

  if (filters.facilityId !== undefined) {
    where.facility_id = filters.facilityId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.medication_name = {
        contains: searchTerm,
        mode: 'insensitive',
      };
    }
  }

  return where;
};

const getOrderBy = (
  sortBy: PrescriptionPaginationOptions['sortBy'],
  sortOrder: PrescriptionPaginationOptions['sortOrder']
): Prisma.prescriptionsOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'medicationName':
      return { medication_name: sortOrder };
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
        prescriber_user_id: data.prescriberUserId,
        facility_id: data.facilityId ?? null,
        medication_name: data.medicationName,
        quantity: data.quantity,
        status: data.status ?? null,
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

    if (data.prescriberUserId !== undefined) {
      updateData.prescriber_user_id = data.prescriberUserId;
    }

    if (data.facilityId !== undefined) {
      updateData.facility_id = data.facilityId ?? null;
    }

    if (data.medicationName !== undefined) {
      updateData.medication_name = data.medicationName;
    }

    if (data.quantity !== undefined) {
      updateData.quantity = data.quantity;
    }

    if (data.status !== undefined) {
      updateData.status = data.status ?? null;
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
