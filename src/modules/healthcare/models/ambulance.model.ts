import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
import type {
  Ambulance,
  CreateAmbulanceData,
  UpdateAmbulanceData,
  AmbulanceFilterOptions,
  AmbulancePaginationOptions,
  PaginatedAmbulances,
} from '../types';

type GeoPoint = NonNullable<Ambulance['currentLocation']>;

const ambulanceSelect = {
  id: true,
  vehicle_number: true,
  status: true,
  current_location: true,
  base_facility_id: true,
  created_at: true,
} satisfies Prisma.ambulancesSelect;

type AmbulanceRecord = Prisma.ambulancesGetPayload<{
  select: typeof ambulanceSelect;
}>;

const mapGeoPoint = (value: unknown): GeoPoint | null => {
  if (
    value &&
    typeof value === 'object' &&
    (value as Record<string, unknown>).type === 'Point'
  ) {
    const coordinates = (value as Record<string, unknown>).coordinates;
    if (
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      typeof coordinates[0] === 'number' &&
      typeof coordinates[1] === 'number'
    ) {
      return {
        type: 'Point',
        coordinates: [coordinates[0], coordinates[1]],
      };
    }
  }

  return null;
};

const mapAmbulance = (record: AmbulanceRecord): Ambulance => ({
  id: record.id,
  vehicleNumber: record.vehicle_number,
  status: record.status ?? null,
  currentLocation: mapGeoPoint(record.current_location),
  baseFacilityId: record.base_facility_id ?? null,
  createdAt: record.created_at,
});

const buildWhereClause = (
  filters: AmbulanceFilterOptions = {}
): Prisma.ambulancesWhereInput => {
  const where: Prisma.ambulancesWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.baseFacilityId !== undefined) {
    where.base_facility_id = filters.baseFacilityId;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.vehicle_number = {
        contains: searchTerm,
        mode: 'insensitive',
      };
    }
  }

  return where;
};

const getOrderBy = (
  sortBy: AmbulancePaginationOptions['sortBy'],
  sortOrder: AmbulancePaginationOptions['sortOrder']
): Prisma.ambulancesOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'vehicleNumber':
      return { vehicle_number: sortOrder };
    case 'createdAt':
    default:
      return { created_at: sortOrder };
  }
};

const serializeGeoPoint = (
  point: GeoPoint | undefined | null
): Prisma.InputJsonValue | null => {
  if (!point) return null;
  return point as unknown as Prisma.InputJsonValue;
};

const findById = async (id: number): Promise<Ambulance | null> => {
  try {
    const record = await prisma.ambulances.findUnique({
      where: { id },
      select: ambulanceSelect,
    });

    return record ? mapAmbulance(record) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMany = async (
  filters: AmbulanceFilterOptions = {}
): Promise<Ambulance[]> => {
  try {
    const records = await prisma.ambulances.findMany({
      where: buildWhereClause(filters),
      select: ambulanceSelect,
      orderBy: { created_at: 'desc' },
    });

    return records.map(mapAmbulance);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: AmbulanceFilterOptions,
  pagination: AmbulancePaginationOptions
): Promise<PaginatedAmbulances> => {
  try {
    const { page, limit, sortBy, sortOrder } = pagination;
    const where = buildWhereClause(filters);
    const orderBy = getOrderBy(sortBy, sortOrder);

    const [records, total] = await Promise.all([
      prisma.ambulances.findMany({
        where,
        select: ambulanceSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.ambulances.count({ where }),
    ]);

    return {
      ambulances: records.map(mapAmbulance),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateAmbulanceData): Promise<Ambulance> => {
  try {
    const record = await prisma.ambulances.create({
      data: {
        vehicle_number: data.vehicleNumber,
        status: data.status ?? null,
        current_location: serializeGeoPoint(data.currentLocation ?? null),
        base_facility_id: data.baseFacilityId ?? null,
      },
      select: ambulanceSelect,
    });

    return mapAmbulance(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdateAmbulanceData
): Promise<Ambulance> => {
  try {
    const updateData: Prisma.ambulancesUncheckedUpdateInput = {};

    if (data.vehicleNumber !== undefined) {
      updateData.vehicle_number = data.vehicleNumber;
    }

    if (data.status !== undefined) {
      updateData.status = data.status ?? null;
    }

    if (data.currentLocation !== undefined) {
      updateData.current_location = serializeGeoPoint(
        data.currentLocation ?? null
      );
    }

    if (data.baseFacilityId !== undefined) {
      updateData.base_facility_id = data.baseFacilityId ?? null;
    }

    const record = await prisma.ambulances.update({
      where: { id },
      data: updateData,
      select: ambulanceSelect,
    });

    return mapAmbulance(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.ambulances.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findById, findMany, findWithPagination, create, update, deleteById };
