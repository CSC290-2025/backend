import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
import type {
  Patient,
  CreatePatientData,
  UpdatePatientData,
  PatientFilterOptions,
  PaginationOptions,
  PaginatedPatients,
} from '../types';

const patientSelect = {
  id: true,
  user_id: true,
  emergency_contact: true,
  created_at: true,
} satisfies Prisma.patientsSelect;

type PatientRecord = Prisma.patientsGetPayload<{
  select: typeof patientSelect;
}>;

const mapPatient = (patient: PatientRecord): Patient => ({
  id: patient.id,
  userId: patient.user_id ?? null,
  emergencyContact: patient.emergency_contact ?? null,
  createdAt: patient.created_at,
});

const buildWhereClause = (
  filters: PatientFilterOptions = {}
): Prisma.patientsWhereInput => {
  const where: Prisma.patientsWhereInput = {};

  if (filters.userId !== undefined) {
    where.user_id = filters.userId;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();

    if (searchTerm.length > 0) {
      where.OR = [
        {
          emergency_contact: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }
  }

  return where;
};

const getOrderBy = (
  sortBy: PaginationOptions['sortBy'],
  sortOrder: PaginationOptions['sortOrder']
): Prisma.patientsOrderByWithRelationInput => {
  if (sortBy === 'id') {
    return { id: sortOrder };
  }

  return { created_at: sortOrder };
};

const findById = async (id: number): Promise<Patient | null> => {
  try {
    const patient = await prisma.patients.findUnique({
      where: { id },
      select: patientSelect,
    });
    return patient ? mapPatient(patient) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findByUserId = async (userId: number): Promise<Patient | null> => {
  try {
    const patient = await prisma.patients.findFirst({
      where: { user_id: userId },
      select: patientSelect,
    });
    return patient ? mapPatient(patient) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreatePatientData): Promise<Patient> => {
  try {
    const patient = await prisma.patients.create({
      data: {
        user_id: data.userId ?? null,
        emergency_contact: data.emergencyContact ?? null,
      },
      select: patientSelect,
    });
    return mapPatient(patient);
  } catch (error) {
    console.log('error', error);
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdatePatientData
): Promise<Patient> => {
  try {
    const updateData: Prisma.patientsUncheckedUpdateInput = {};

    if (data.userId !== undefined) {
      updateData.user_id = data.userId;
    }

    if (data.emergencyContact !== undefined) {
      updateData.emergency_contact = data.emergencyContact;
    }

    const patient = await prisma.patients.update({
      where: { id },
      data: updateData,
      select: patientSelect,
    });
    return mapPatient(patient);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.patients.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMany = async (
  filters: PatientFilterOptions = {}
): Promise<Patient[]> => {
  try {
    const patientRecords = await prisma.patients.findMany({
      where: buildWhereClause(filters),
      select: patientSelect,
      orderBy: { created_at: 'desc' },
    });

    return patientRecords.map(mapPatient);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: PatientFilterOptions,
  pagination: PaginationOptions
): Promise<PaginatedPatients> => {
  try {
    const { page, limit, sortBy, sortOrder } = pagination;
    const where = buildWhereClause(filters);
    const orderBy = getOrderBy(sortBy, sortOrder);

    const [records, total] = await Promise.all([
      prisma.patients.findMany({
        where,
        select: patientSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.patients.count({ where }),
    ]);

    return {
      patients: records.map(mapPatient),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findById,
  findByUserId,
  findMany,
  findWithPagination,
  create,
  update,
  deleteById,
};
