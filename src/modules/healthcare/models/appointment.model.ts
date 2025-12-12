import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilterOptions,
  AppointmentPaginationOptions,
  PaginatedAppointments,
} from '../types';

const appointmentSelect = {
  id: true,
  patient_id: true,
  facility_id: true,
  appointment_at: true,
  type: true,
  created_at: true,
  doctor_id: true,
  consultation_fee: true,
} satisfies Prisma.appointmentsSelect;

type AppointmentRecord = Prisma.appointmentsGetPayload<{
  select: typeof appointmentSelect;
}>;

const mapAppointment = (record: AppointmentRecord): Appointment => ({
  id: record.id,
  patientId: record.patient_id ?? null,
  facilityId: record.facility_id ?? null,
  appointmentAt: record.appointment_at ?? null,
  type: record.type ?? null,
  createdAt: record.created_at,
  doctorId: record.doctor_id ?? null,
  consultationFee: record.consultation_fee
    ? Number(record.consultation_fee)
    : null,
});

const buildWhereClause = (
  filters: AppointmentFilterOptions = {}
): Prisma.appointmentsWhereInput => {
  const where: Prisma.appointmentsWhereInput = {};

  if (filters.patientId !== undefined) {
    where.patient_id = filters.patientId;
  }

  if (filters.facilityId !== undefined) {
    where.facility_id = filters.facilityId;
  }

  if (filters.doctorId !== undefined) {
    where.doctor_id = filters.doctorId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.type = {
        contains: searchTerm,
        mode: 'insensitive',
      };
    }
  }

  return where;
};

const getOrderBy = (
  sortBy: AppointmentPaginationOptions['sortBy'],
  sortOrder: AppointmentPaginationOptions['sortOrder']
): Prisma.appointmentsOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'appointmentAt':
      return { appointment_at: sortOrder };
    case 'createdAt':
    default:
      return { created_at: sortOrder };
  }
};

const findById = async (id: number): Promise<Appointment | null> => {
  try {
    const record = await prisma.appointments.findUnique({
      where: { id },
      select: appointmentSelect,
    });

    return record ? mapAppointment(record) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMany = async (
  filters: AppointmentFilterOptions = {}
): Promise<Appointment[]> => {
  try {
    const records = await prisma.appointments.findMany({
      where: buildWhereClause(filters),
      select: appointmentSelect,
      orderBy: { created_at: 'desc' },
    });

    return records.map(mapAppointment);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: AppointmentFilterOptions,
  pagination: AppointmentPaginationOptions
): Promise<PaginatedAppointments> => {
  try {
    const { page, limit, sortBy, sortOrder } = pagination;
    const where = buildWhereClause(filters);
    const orderBy = getOrderBy(sortBy, sortOrder);

    const [records, total] = await Promise.all([
      prisma.appointments.findMany({
        where,
        select: appointmentSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.appointments.count({ where }),
    ]);

    return {
      appointments: records.map(mapAppointment),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateAppointmentData): Promise<Appointment> => {
  try {
    const record = await prisma.appointments.create({
      data: {
        patient_id: data.patientId,
        facility_id: data.facilityId,
        appointment_at: data.appointmentAt,
        type: data.type,
        doctor_id: data.doctorId,
        consultation_fee: data.consultationFee,
      },
      select: appointmentSelect,
    });

    return mapAppointment(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdateAppointmentData
): Promise<Appointment> => {
  try {
    const updateData: Prisma.appointmentsUncheckedUpdateInput = {};

    if (data.patientId !== undefined) updateData.patient_id = data.patientId;
    if (data.facilityId !== undefined) updateData.facility_id = data.facilityId;
    if (data.appointmentAt !== undefined)
      updateData.appointment_at = data.appointmentAt;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.doctorId !== undefined) updateData.doctor_id = data.doctorId;
    if (data.consultationFee !== undefined)
      updateData.consultation_fee = data.consultationFee;

    const record = await prisma.appointments.update({
      where: { id },
      data: updateData,
      select: appointmentSelect,
    });

    return mapAppointment(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const isDoctorSlotAvailable = async (
  doctorId: number,
  appointmentAt: Date
): Promise<boolean> => {
  try {
    const existing = await prisma.appointments.findFirst({
      where: {
        doctor_id: doctorId,
        appointment_at: appointmentAt,
      },
      select: { id: true },
    });

    return !existing;
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.appointments.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findById,
  findMany,
  findWithPagination,
  create,
  update,
  deleteById,
  isDoctorSlotAvailable,
};
