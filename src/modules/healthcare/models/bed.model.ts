import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
import type {
  Bed,
  CreateBedData,
  UpdateBedData,
  BedFilterOptions,
  BedPaginationOptions,
  PaginatedBeds,
} from '../types';

const bedSelect = {
  id: true,
  facility_id: true,
  bed_number: true,
  bed_type: true,
  status: true,
  patient_id: true,
  admission_date: true,
  created_at: true,
} satisfies Prisma.bedsSelect;

type BedRecord = Prisma.bedsGetPayload<{
  select: typeof bedSelect;
}>;

const mapBed = (record: BedRecord): Bed => ({
  id: record.id,
  facilityId: record.facility_id ?? null,
  bedNumber: record.bed_number ?? null,
  bedType: record.bed_type ?? null,
  status: record.status ?? null,
  patientId: record.patient_id ?? null,
  admissionDate: record.admission_date ?? null,
  createdAt: record.created_at,
});

const buildWhereClause = (
  filters: BedFilterOptions = {}
): Prisma.bedsWhereInput => {
  const where: Prisma.bedsWhereInput = {};

  if (filters.facilityId !== undefined) {
    where.facility_id = filters.facilityId;
  }

  if (filters.patientId !== undefined) {
    where.patient_id = filters.patientId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.bedType) {
    where.bed_type = filters.bedType;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.bed_number = {
        contains: searchTerm,
        mode: 'insensitive',
      };
    }
  }

  return where;
};

const getOrderBy = (
  sortBy: BedPaginationOptions['sortBy'],
  sortOrder: BedPaginationOptions['sortOrder']
): Prisma.bedsOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'bedNumber':
      return { bed_number: sortOrder };
    case 'createdAt':
    default:
      return { created_at: sortOrder };
  }
};

const findById = async (id: number): Promise<Bed | null> => {
  try {
    const record = await prisma.beds.findUnique({
      where: { id },
      select: bedSelect,
    });

    return record ? mapBed(record) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMany = async (filters: BedFilterOptions = {}): Promise<Bed[]> => {
  try {
    const records = await prisma.beds.findMany({
      where: buildWhereClause(filters),
      select: bedSelect,
      orderBy: { created_at: 'desc' },
    });

    return records.map(mapBed);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: BedFilterOptions,
  pagination: BedPaginationOptions
): Promise<PaginatedBeds> => {
  try {
    const { page, limit, sortBy, sortOrder } = pagination;
    const where = buildWhereClause(filters);
    const orderBy = getOrderBy(sortBy, sortOrder);

    const [records, total] = await Promise.all([
      prisma.beds.findMany({
        where,
        select: bedSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.beds.count({ where }),
    ]);

    return {
      beds: records.map(mapBed),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateBedData): Promise<Bed> => {
  try {
    const record = await prisma.beds.create({
      data: {
        facility_id: data.facilityId,
        bed_number: data.bedNumber,
        bed_type: data.bedType,
        status: data.status,
        patient_id: data.patientId,
        admission_date: data.admissionDate,
      },
      select: bedSelect,
    });

    return mapBed(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (id: number, data: UpdateBedData): Promise<Bed> => {
  try {
    const updateData: Prisma.bedsUncheckedUpdateInput = {};

    if (data.facilityId !== undefined) updateData.facility_id = data.facilityId;
    if (data.bedNumber !== undefined) updateData.bed_number = data.bedNumber;
    if (data.bedType !== undefined) updateData.bed_type = data.bedType;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.patientId !== undefined) updateData.patient_id = data.patientId;
    if (data.admissionDate !== undefined)
      updateData.admission_date = data.admissionDate;

    const record = await prisma.beds.update({
      where: { id },
      data: updateData,
      select: bedSelect,
    });

    return mapBed(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.beds.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findById, findMany, findWithPagination, create, update, deleteById };
