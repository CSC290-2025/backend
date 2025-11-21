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
  staff_user_id: true,
  appointment_at: true,
  type: true,
  status: true,
  created_at: true,
} satisfies Prisma.appointmentsSelect;

type AppointmentRecord = Prisma.appointmentsGetPayload<{
  select: typeof appointmentSelect;
}>;

const mapAppointment = (appointment: AppointmentRecord): Appointment => ({
  id: appointment.id,
  patientId: appointment.patient_id ?? null,
  facilityId: appointment.facility_id ?? null,
  staffUserId: appointment.staff_user_id ?? null,
  appointmentAt: appointment.appointment_at ?? null,
  type: appointment.type ?? null,
  status: appointment.status ?? null,
  createdAt: appointment.created_at,
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

  if (filters.staffUserId !== undefined) {
    where.staff_user_id = filters.staffUserId;
  }

  if (filters.status) {
    where.status = {
      equals: filters.status,
      mode: 'insensitive',
    };
  }

  if (filters.type) {
    where.type = {
      equals: filters.type,
      mode: 'insensitive',
    };
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();

    if (searchTerm.length > 0) {
      where.OR = [
        {
          type: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          status: {
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
  sortBy: AppointmentPaginationOptions['sortBy'],
  sortOrder: AppointmentPaginationOptions['sortOrder']
): Prisma.appointmentsOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'appointmentAt':
      return { appointment_at: sortOrder };
    default:
      return { created_at: sortOrder };
  }
};

const findById = async (id: number): Promise<Appointment | null> => {
  try {
    const appointment = await prisma.appointments.findUnique({
      where: { id },
      select: appointmentSelect,
    });
    return appointment ? mapAppointment(appointment) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateAppointmentData): Promise<Appointment> => {
  try {
    const appointment = await prisma.appointments.create({
      data: {
        patient_id: data.patientId ?? null,
        facility_id: data.facilityId ?? null,
        staff_user_id: data.staffUserId ?? null,
        appointment_at: data.appointmentAt ?? null,
        type: data.type ?? null,
        status: data.status ?? null,
      },
      select: appointmentSelect,
    });
    return mapAppointment(appointment);
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

    if (data.patientId !== undefined) {
      updateData.patient_id = data.patientId;
    }

    if (data.facilityId !== undefined) {
      updateData.facility_id = data.facilityId;
    }

    if (data.staffUserId !== undefined) {
      updateData.staff_user_id = data.staffUserId;
    }

    if (data.appointmentAt !== undefined) {
      updateData.appointment_at = data.appointmentAt;
    }

    if (data.type !== undefined) {
      updateData.type = data.type;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const appointment = await prisma.appointments.update({
      where: { id },
      data: updateData,
      select: appointmentSelect,
    });

    return mapAppointment(appointment);
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

const findMany = async (
  filters: AppointmentFilterOptions = {}
): Promise<Appointment[]> => {
  try {
    const appointments = await prisma.appointments.findMany({
      where: buildWhereClause(filters),
      select: appointmentSelect,
      orderBy: { created_at: 'desc' },
    });

    return appointments.map(mapAppointment);
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

export { findById, create, update, deleteById, findMany, findWithPagination };
