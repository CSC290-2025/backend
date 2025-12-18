import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
import type {
  Doctor,
  CreateDoctorData,
  UpdateDoctorData,
  DoctorFilterOptions,
  DoctorPaginationOptions,
  PaginatedDoctors,
} from '../types';

const doctorSelect = {
  id: true,
  name: true,
  specialization: true,
  current_status: true,
  consultation_fee: true,
  created_at: true,
  facilities: {
    select: {
      id: true,
    },
  },
} satisfies Prisma.doctorsSelect;

type DoctorRecord = Prisma.doctorsGetPayload<{
  select: typeof doctorSelect;
}>;

const mapDoctor = (record: DoctorRecord): Doctor => ({
  id: record.id,
  doctorName: record.name ?? null,
  specialization: record.specialization ?? null,
  currentStatus: record.current_status ?? null,
  consultationFee: record.consultation_fee
    ? Number(record.consultation_fee)
    : null,
  facilityId: record.facilities?.id ?? null,
  // doctors table has no department column; always null for now
  departmentId: null,
  createdAt: record.created_at ?? new Date(),
});

const buildWhereClause = (
  filters: DoctorFilterOptions = {}
): Prisma.doctorsWhereInput => {
  const where: Prisma.doctorsWhereInput = {};

  if (filters.specialization) {
    where.specialization = {
      contains: filters.specialization,
      mode: 'insensitive',
    };
  }

  if (filters.currentStatus) {
    where.current_status = filters.currentStatus;
  }

  if (filters.facilityId !== undefined) {
    where.facilities = {
      id: filters.facilityId,
    };
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.OR = [
        { specialization: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
  }

  return where;
};

const getOrderBy = (
  sortBy: DoctorPaginationOptions['sortBy'],
  sortOrder: DoctorPaginationOptions['sortOrder']
): Prisma.doctorsOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'specialization':
      return { specialization: sortOrder };
    case 'createdAt':
    default:
      return { created_at: sortOrder };
  }
};

const findById = async (id: number): Promise<Doctor | null> => {
  try {
    const record = await prisma.doctors.findUnique({
      where: { id },
      select: doctorSelect,
    });

    return record ? mapDoctor(record) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMany = async (
  filters: DoctorFilterOptions = {}
): Promise<Doctor[]> => {
  try {
    const records = await prisma.doctors.findMany({
      where: buildWhereClause(filters),
      select: doctorSelect,
      orderBy: { created_at: 'desc' },
    });

    return records.map(mapDoctor);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: DoctorFilterOptions,
  pagination: DoctorPaginationOptions
): Promise<PaginatedDoctors> => {
  try {
    const { page, limit, sortBy, sortOrder } = pagination;
    const where = buildWhereClause(filters);
    const orderBy = getOrderBy(sortBy, sortOrder);

    const [records, total] = await Promise.all([
      prisma.doctors.findMany({
        where,
        select: doctorSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.doctors.count({ where }),
    ]);

    return {
      doctors: records.map(mapDoctor),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateDoctorData): Promise<Doctor> => {
  try {
    const record = await prisma.doctors.create({
      data: {
        name: data.doctorName ?? null,
        specialization: data.specialization ?? null,
        current_status: data.currentStatus ?? null,
        consultation_fee: data.consultationFee ?? null,
        ...(data.facilityId !== undefined
          ? {
              facilities: {
                connect: { id: data.facilityId },
              },
            }
          : {}),
      },
      select: doctorSelect,
    });

    return mapDoctor(record);
  } catch (error) {
    console.error(error);
    handlePrismaError(error);
  }
};

const update = async (id: number, data: UpdateDoctorData): Promise<Doctor> => {
  try {
    const updateData: Prisma.doctorsUpdateInput = {};

    if (data.doctorName !== undefined) {
      updateData.name = data.doctorName;
    }

    if (data.specialization !== undefined) {
      updateData.specialization = data.specialization;
    }

    if (data.currentStatus !== undefined) {
      updateData.current_status = data.currentStatus;
    }

    if (data.consultationFee !== undefined) {
      updateData.consultation_fee = data.consultationFee;
    }

    if (data.facilityId !== undefined) {
      updateData.facilities =
        data.facilityId === null
          ? { disconnect: true }
          : { connect: { id: data.facilityId } };
    }

    const record = await prisma.doctors.update({
      where: { id },
      data: updateData,
      select: doctorSelect,
    });

    return mapDoctor(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.doctors.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findById, findMany, findWithPagination, create, update, deleteById };
