import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilterOptions,
  AppointmentPaginationOptions,
} from '../types';
import * as AppointmentModel from '../models/appointment.model';

const parseRequiredNumber = (value: string, fieldName: string): number => {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new ValidationError(`Invalid ${fieldName}`);
  }

  return parsed;
};

const parseOptionalNumber = (value?: string): number | undefined => {
  if (value === undefined) return undefined;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parsePagination = (
  query: Record<string, string | undefined>
): AppointmentPaginationOptions => {
  const page = parseOptionalNumber(query.page) ?? 1;
  const limit = parseOptionalNumber(query.limit) ?? 10;

  const sortBy: AppointmentPaginationOptions['sortBy'] = [
    'id',
    'appointmentAt',
  ].includes(query.sortBy ?? '')
    ? (query.sortBy as AppointmentPaginationOptions['sortBy'])
    : 'createdAt';

  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return {
    page,
    limit,
    sortBy,
    sortOrder,
  };
};

const parseFilters = (
  query: Record<string, string | undefined>
): AppointmentFilterOptions => ({
  patientId: parseOptionalNumber(query.patientId),
  facilityId: parseOptionalNumber(query.facilityId),
  staffUserId: parseOptionalNumber(query.staffUserId),
  status: query.status,
  type: query.type,
  search: query.search,
});

const getAppointment = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'appointment id');
  const appointment = await AppointmentModel.findById(id);

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  return successResponse(c, { appointment });
};

const createAppointment = async (c: Context) => {
  const payload = (await c.req.json()) as CreateAppointmentData;
  const appointment = await AppointmentModel.create(payload);
  return successResponse(
    c,
    { appointment },
    201,
    'Appointment created successfully'
  );
};

const updateAppointment = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'appointment id');
  const payload = (await c.req.json()) as UpdateAppointmentData;

  const appointment = await AppointmentModel.update(id, payload);
  return successResponse(
    c,
    { appointment },
    200,
    'Appointment updated successfully'
  );
};

const deleteAppointment = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'appointment id');
  await AppointmentModel.deleteById(id);

  return successResponse(c, null, 200, 'Appointment deleted successfully');
};

const listAppointments = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);
  const pagination = parsePagination(rawQuery);

  const appointments = await AppointmentModel.findWithPagination(
    filters,
    pagination
  );
  return successResponse(c, appointments);
};

const listAllAppointments = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);

  const appointments = await AppointmentModel.findMany(filters);
  return successResponse(c, { appointments });
};

export {
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  listAppointments,
  listAllAppointments,
};
