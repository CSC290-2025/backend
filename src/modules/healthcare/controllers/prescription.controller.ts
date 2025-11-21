import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  CreatePrescriptionData,
  UpdatePrescriptionData,
  PrescriptionFilterOptions,
  PrescriptionPaginationOptions,
} from '../types';
import * as PrescriptionModel from '../models/prescription.model';

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

const parseFilters = (
  query: Record<string, string | undefined>
): PrescriptionFilterOptions => ({
  patientId: parseOptionalNumber(query.patientId),
  prescriberUserId: parseOptionalNumber(query.prescriberUserId),
  facilityId: parseOptionalNumber(query.facilityId),
  status: query.status,
  search: query.search,
});

const parsePagination = (
  query: Record<string, string | undefined>
): PrescriptionPaginationOptions => {
  const page = parseOptionalNumber(query.page) ?? 1;
  const limit = parseOptionalNumber(query.limit) ?? 10;

  const validSortBy: PrescriptionPaginationOptions['sortBy'][] = [
    'id',
    'createdAt',
    'medicationName',
  ];

  const sortBy = validSortBy.includes(
    (query.sortBy ?? '') as PrescriptionPaginationOptions['sortBy']
  )
    ? (query.sortBy as PrescriptionPaginationOptions['sortBy'])
    : 'createdAt';

  const sortOrder =
    query.sortOrder === 'asc' ? ('asc' as const) : ('desc' as const);

  return {
    page,
    limit,
    sortBy,
    sortOrder,
  };
};

const getPrescription = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'prescription id');
  const prescription = await PrescriptionModel.findById(id);

  if (!prescription) {
    throw new NotFoundError('Prescription not found');
  }

  return successResponse(c, { prescription });
};

const createPrescription = async (c: Context) => {
  const payload = (await c.req.json()) as CreatePrescriptionData;
  const prescription = await PrescriptionModel.create(payload);

  return successResponse(
    c,
    { prescription },
    201,
    'Prescription created successfully'
  );
};

const updatePrescription = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'prescription id');
  const payload = (await c.req.json()) as UpdatePrescriptionData;

  const prescription = await PrescriptionModel.update(id, payload);

  return successResponse(
    c,
    { prescription },
    200,
    'Prescription updated successfully'
  );
};

const deletePrescription = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'prescription id');
  await PrescriptionModel.deleteById(id);

  return successResponse(c, null, 200, 'Prescription deleted successfully');
};

const listPrescriptions = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);
  const pagination = parsePagination(rawQuery);

  const prescriptions = await PrescriptionModel.findWithPagination(
    filters,
    pagination
  );

  return successResponse(c, prescriptions);
};

const listAllPrescriptions = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);

  const prescriptions = await PrescriptionModel.findMany(filters);

  return successResponse(c, { prescriptions });
};

export {
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
  listPrescriptions,
  listAllPrescriptions,
};
