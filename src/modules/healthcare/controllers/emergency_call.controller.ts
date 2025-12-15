import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  CreateEmergencyCallData,
  UpdateEmergencyCallData,
  EmergencyCallFilterOptions,
  EmergencyCallPaginationOptions,
} from '../types';
import * as EmergencyCallModel from '../models/emergency_call.model';

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
): EmergencyCallFilterOptions => ({
  patientId: parseOptionalNumber(query.patientId),
  severity: query.severity,
  status: query.status,
  emergencyType: query.emergencyType,
  ambulanceId: parseOptionalNumber(query.ambulanceId),
  facilityId: parseOptionalNumber(query.facilityId),
  search: query.search,
});

const parsePagination = (
  query: Record<string, string | undefined>
): EmergencyCallPaginationOptions => {
  const page = parseOptionalNumber(query.page) ?? 1;
  const limit = parseOptionalNumber(query.limit) ?? 10;

  const sortBy =
    query.sortBy === 'id' ? ('id' as const) : ('createdAt' as const);

  const sortOrder =
    query.sortOrder === 'asc' ? ('asc' as const) : ('desc' as const);

  return {
    page,
    limit,
    sortBy,
    sortOrder,
  };
};

const getEmergencyCall = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'emergency call id');
  const emergencyCall = await EmergencyCallModel.findById(id);

  if (!emergencyCall) {
    throw new NotFoundError('Emergency call not found');
  }

  return successResponse(c, { emergencyCall });
};

const createEmergencyCall = async (c: Context) => {
  const payload = (await c.req.json()) as CreateEmergencyCallData;
  const emergencyCall = await EmergencyCallModel.create(payload);

  return successResponse(
    c,
    { emergencyCall },
    201,
    'Emergency call created successfully'
  );
};

const updateEmergencyCall = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'emergency call id');
  const payload = (await c.req.json()) as UpdateEmergencyCallData;

  const emergencyCall = await EmergencyCallModel.update(id, payload);

  return successResponse(
    c,
    { emergencyCall },
    200,
    'Emergency call updated successfully'
  );
};

const deleteEmergencyCall = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'emergency call id');
  await EmergencyCallModel.deleteById(id);

  return successResponse(c, null, 200, 'Emergency call deleted successfully');
};

const listEmergencyCalls = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);
  const pagination = parsePagination(rawQuery);

  const emergencyCalls = await EmergencyCallModel.findWithPagination(
    filters,
    pagination
  );

  return successResponse(c, emergencyCalls);
};

const listAllEmergencyCalls = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);

  const emergencyCalls = await EmergencyCallModel.findMany(filters);

  return successResponse(c, { emergencyCalls });
};

export {
  getEmergencyCall,
  createEmergencyCall,
  updateEmergencyCall,
  deleteEmergencyCall,
  listEmergencyCalls,
  listAllEmergencyCalls,
};
