import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  CreateFacilityData,
  UpdateFacilityData,
  FacilityFilterOptions,
  FacilityPaginationOptions,
} from '../types';
import * as FacilityModel from '../models/facility.model';

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

const parseOptionalBoolean = (value?: string): boolean | undefined => {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const parsePagination = (
  query: Record<string, string | undefined>
): FacilityPaginationOptions => {
  const page = parseOptionalNumber(query.page) ?? 1;
  const limit = parseOptionalNumber(query.limit) ?? 10;

  const sortBy: FacilityPaginationOptions['sortBy'] = ['id', 'name'].includes(
    query.sortBy ?? ''
  )
    ? (query.sortBy as FacilityPaginationOptions['sortBy'])
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
): FacilityFilterOptions => ({
  addressId: parseOptionalNumber(query.addressId),
  departmentId: parseOptionalNumber(query.departmentId),
  facilityType: query.facilityType,
  emergencyServices: parseOptionalBoolean(query.emergencyServices),
  search: query.search,
});

const getFacility = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'facility id');
  const facility = await FacilityModel.findById(id);

  if (!facility) {
    throw new NotFoundError('Facility not found');
  }

  return successResponse(c, { facility });
};

const createFacility = async (c: Context) => {
  const payload = (await c.req.json()) as CreateFacilityData;
  const facility = await FacilityModel.create(payload);
  return successResponse(c, { facility }, 201, 'Facility created successfully');
};

const updateFacility = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'facility id');
  const payload = (await c.req.json()) as UpdateFacilityData;

  const facility = await FacilityModel.update(id, payload);
  return successResponse(c, { facility }, 200, 'Facility updated successfully');
};

const deleteFacility = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'facility id');
  await FacilityModel.deleteById(id);

  return successResponse(c, null, 200, 'Facility deleted successfully');
};

const listFacilities = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);
  const pagination = parsePagination(rawQuery);

  const facilities = await FacilityModel.findWithPagination(
    filters,
    pagination
  );
  return successResponse(c, facilities);
};

const listAllFacilities = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);

  const facilities = await FacilityModel.findMany(filters);
  return successResponse(c, { facilities });
};

export {
  getFacility,
  createFacility,
  updateFacility,
  deleteFacility,
  listFacilities,
  listAllFacilities,
};
