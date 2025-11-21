import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  CreateBedData,
  UpdateBedData,
  BedFilterOptions,
  BedPaginationOptions,
} from '../types';
import * as BedModel from '../models/bed.model';

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
): BedPaginationOptions => {
  const page = parseOptionalNumber(query.page) ?? 1;
  const limit = parseOptionalNumber(query.limit) ?? 10;

  const sortBy: BedPaginationOptions['sortBy'] = ['id', 'bedNumber'].includes(
    query.sortBy ?? ''
  )
    ? (query.sortBy as BedPaginationOptions['sortBy'])
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
): BedFilterOptions => ({
  facilityId: parseOptionalNumber(query.facilityId),
  patientId: parseOptionalNumber(query.patientId),
  status: query.status,
  search: query.search,
});

const getBed = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'bed id');
  const bed = await BedModel.findById(id);

  if (!bed) {
    throw new NotFoundError('Bed not found');
  }

  return successResponse(c, { bed });
};

const createBed = async (c: Context) => {
  const payload = (await c.req.json()) as CreateBedData;
  const bed = await BedModel.create(payload);
  return successResponse(c, { bed }, 201, 'Bed created successfully');
};

const updateBed = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'bed id');
  const payload = (await c.req.json()) as UpdateBedData;

  const bed = await BedModel.update(id, payload);
  return successResponse(c, { bed }, 200, 'Bed updated successfully');
};

const deleteBed = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'bed id');
  await BedModel.deleteById(id);

  return successResponse(c, null, 200, 'Bed deleted successfully');
};

const listBeds = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);
  const pagination = parsePagination(rawQuery);

  const beds = await BedModel.findWithPagination(filters, pagination);
  return successResponse(c, beds);
};

const listAllBeds = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);

  const beds = await BedModel.findMany(filters);
  return successResponse(c, { beds });
};

export { getBed, createBed, updateBed, deleteBed, listBeds, listAllBeds };
