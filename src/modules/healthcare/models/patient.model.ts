import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import { Prisma } from '@/generated/prisma';
import type {
  Patient,
  CreatePatientData,
  UpdatePatientData,
  PatientFilterOptions,
  PatientPaginationOptions,
  PaginatedPatients,
} from '../types';

const patientSelect = {
  id: true,
  emergency_contact: true,
  date_of_birth: true,
  blood_type: true,
  total_payments: true,
  appointment_history: true,
  created_at: true,
} satisfies Prisma.patientsSelect;

type PatientRecord = Prisma.patientsGetPayload<{
  select: typeof patientSelect;
}>;

const mapPatient = (patient: PatientRecord): Patient => ({
  id: patient.id,
  emergencyContact: patient.emergency_contact ?? null,
  dateOfBirth: patient.date_of_birth ?? null,
  bloodType: patient.blood_type ?? null,
  totalPayments: patient.total_payments ? Number(patient.total_payments) : null,
  appointmentHistory: patient.appointment_history ?? null,
  createdAt: patient.created_at,
});

const buildWhereClause = (
  filters: PatientFilterOptions = {}
): Prisma.patientsWhereInput => {
  const where: Prisma.patientsWhereInput = {};

  if (filters.bloodType) {
    where.blood_type = filters.bloodType;
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
        // Add more search fields if needed
      ];
    }
  }

  return where;
};

const getOrderBy = (
  sortBy: PatientPaginationOptions['sortBy'],
  sortOrder: PatientPaginationOptions['sortOrder']
): Prisma.patientsOrderByWithRelationInput => {
  if (sortBy === 'id') {
    return { id: sortOrder };
  }
  if (sortBy === 'dateOfBirth') {
    return { date_of_birth: sortOrder };
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
        emergency_contact: data.emergencyContact ?? null,
        date_of_birth: data.dateOfBirth ?? null,
        blood_type: data.bloodType ?? null,
        total_payments: data.totalPayments ?? 0,
        appointment_history: data.appointmentHistory ?? Prisma.JsonNull,
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

    if (data.emergencyContact !== undefined) {
      updateData.emergency_contact = data.emergencyContact;
    }

    if (data.dateOfBirth !== undefined) {
      updateData.date_of_birth = data.dateOfBirth;
    }

    if (data.bloodType !== undefined) {
      updateData.blood_type = data.bloodType;
    }

    if (data.totalPayments !== undefined) {
      updateData.total_payments = data.totalPayments;
    }

    if (data.appointmentHistory !== undefined) {
      updateData.appointment_history =
        data.appointmentHistory ?? Prisma.JsonNull;
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
  pagination: PatientPaginationOptions
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
