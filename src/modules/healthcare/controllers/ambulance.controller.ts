import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  CreateAmbulanceData,
  UpdateAmbulanceData,
  AmbulanceFilterOptions,
  AmbulancePaginationOptions,
} from '../types';
import * as AmbulanceModel from '../models/ambulance.model';

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
): AmbulanceFilterOptions => ({
  status: query.status,
  baseFacilityId: parseOptionalNumber(query.baseFacilityId),
  search: query.search,
});

const parsePagination = (
  query: Record<string, string | undefined>
): AmbulancePaginationOptions => {
  const page = parseOptionalNumber(query.page) ?? 1;
  const limit = parseOptionalNumber(query.limit) ?? 10;

  const validSortBy: AmbulancePaginationOptions['sortBy'][] = [
    'id',
    'createdAt',
    'vehicleNumber',
  ];

  const sortBy = validSortBy.includes(
    (query.sortBy ?? '') as AmbulancePaginationOptions['sortBy']
  )
    ? (query.sortBy as AmbulancePaginationOptions['sortBy'])
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

const getAmbulance = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'ambulance id');
  const ambulance = await AmbulanceModel.findById(id);

  if (!ambulance) {
    throw new NotFoundError('Ambulance not found');
  }

  return successResponse(c, { ambulance });
};

const createAmbulance = async (c: Context) => {
  const payload = (await c.req.json()) as CreateAmbulanceData;
  const ambulance = await AmbulanceModel.create(payload);

  return successResponse(
    c,
    { ambulance },
    201,
    'Ambulance created successfully'
  );
};

const updateAmbulance = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'ambulance id');
  const payload = (await c.req.json()) as UpdateAmbulanceData;

  const ambulance = await AmbulanceModel.update(id, payload);

  return successResponse(
    c,
    { ambulance },
    200,
    'Ambulance updated successfully'
  );
};

const deleteAmbulance = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'ambulance id');
  await AmbulanceModel.deleteById(id);

  return successResponse(c, null, 200, 'Ambulance deleted successfully');
};

const listAmbulances = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);
  const pagination = parsePagination(rawQuery);

  const ambulances = await AmbulanceModel.findWithPagination(
    filters,
    pagination
  );

  return successResponse(c, ambulances);
};

const listAllAmbulances = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);

  const ambulances = await AmbulanceModel.findMany(filters);

  return successResponse(c, { ambulances });
};

export {
  getAmbulance,
  createAmbulance,
  updateAmbulance,
  deleteAmbulance,
  listAmbulances,
  listAllAmbulances,
};
