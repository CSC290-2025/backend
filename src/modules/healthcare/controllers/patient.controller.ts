import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  CreatePatientData,
  UpdatePatientData,
  PatientFilterOptions,
  PaginationOptions,
} from '../types';
import * as PatientModel from '../models/patient.model';

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
): PaginationOptions => {
  const page = parseOptionalNumber(query.page) ?? 1;
  const limit = parseOptionalNumber(query.limit) ?? 10;

  const sortBy = query.sortBy === 'id' ? 'id' : 'createdAt';
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
): PatientFilterOptions => ({
  userId: parseOptionalNumber(query.userId),
  search: query.search,
});

const getPatient = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'patient id');
  const patient = await PatientModel.findById(id);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  return successResponse(c, { patient });
};

const createPatient = async (c: Context) => {
  const payload = (await c.req.json()) as CreatePatientData;
  const patient = await PatientModel.create(payload);

  return successResponse(c, { patient }, 201, 'Patient created successfully');
};

const updatePatient = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'patient id');
  const payload = (await c.req.json()) as UpdatePatientData;

  const patient = await PatientModel.update(id, payload);
  return successResponse(c, { patient }, 200, 'Patient updated successfully');
};

const deletePatient = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'patient id');
  await PatientModel.deleteById(id);

  return successResponse(c, null, 200, 'Patient deleted successfully');
};

const listPatients = async (c: Context) => {
  const rawQuery = c.req.query();

  const filters = parseFilters(rawQuery);
  const pagination = parsePagination(rawQuery);

  const patients = await PatientModel.findWithPagination(filters, pagination);
  return successResponse(c, patients);
};

const listAllPatients = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);

  const patients = await PatientModel.findMany(filters);
  return successResponse(c, { patients });
};

export {
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  listPatients,
  listAllPatients,
};
