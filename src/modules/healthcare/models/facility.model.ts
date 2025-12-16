import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
import type {
  Facility,
  CreateFacilityData,
  UpdateFacilityData,
  FacilityFilterOptions,
  FacilityPaginationOptions,
  PaginatedFacilities,
} from '../types';

const facilitySelect = {
  id: true,
  name: true,
  facility_type: true,
  address_id: true,
  phone: true,
  emergency_services: true,
  department_id: true,
  created_at: true,
} satisfies Prisma.facilitiesSelect;

type FacilityRecord = Prisma.facilitiesGetPayload<{
  select: typeof facilitySelect;
}>;

const mapFacility = (facility: FacilityRecord): Facility => ({
  id: facility.id,
  name: facility.name,
  facilityType: facility.facility_type ?? null,
  addressId: facility.address_id ?? null,
  phone: facility.phone ?? null,
  location: null,
  emergencyServices: facility.emergency_services ?? null,
  departmentId: facility.department_id ?? null,
  createdAt: facility.created_at,
});

const buildWhereClause = (
  filters: FacilityFilterOptions = {}
): Prisma.facilitiesWhereInput => {
  const where: Prisma.facilitiesWhereInput = {};

  if (filters.addressId !== undefined) {
    where.address_id = filters.addressId;
  }

  if (filters.departmentId !== undefined) {
    where.department_id = filters.departmentId;
  }

  if (filters.facilityType) {
    where.facility_type = {
      equals: filters.facilityType,
      mode: 'insensitive',
    };
  }

  if (filters.emergencyServices !== undefined) {
    where.emergency_services = filters.emergencyServices;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();

    if (searchTerm.length > 0) {
      where.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          facility_type: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          phone: {
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
  sortBy: FacilityPaginationOptions['sortBy'],
  sortOrder: FacilityPaginationOptions['sortOrder']
): Prisma.facilitiesOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'name':
      return { name: sortOrder };
    default:
      return { created_at: sortOrder };
  }
};

const findById = async (id: number): Promise<Facility | null> => {
  try {
    const facility = await prisma.facilities.findUnique({
      where: { id },
      select: facilitySelect,
    });
    return facility ? mapFacility(facility) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateFacilityData): Promise<Facility> => {
  try {
    const facility = await prisma.facilities.create({
      data: {
        name: data.name,
        facility_type: data.facilityType ?? null,
        address_id: data.addressId ?? null,
        phone: data.phone ?? null,
        emergency_services: data.emergencyServices ?? null,
        department_id: data.departmentId ?? null,
      },
      select: facilitySelect,
    });
    return mapFacility(facility);
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdateFacilityData
): Promise<Facility> => {
  try {
    const updateData: Prisma.facilitiesUncheckedUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.facilityType !== undefined) {
      updateData.facility_type = data.facilityType;
    }

    if (data.addressId !== undefined) {
      updateData.address_id = data.addressId;
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }

    if (data.emergencyServices !== undefined) {
      updateData.emergency_services = data.emergencyServices;
    }

    if (data.departmentId !== undefined) {
      updateData.department_id = data.departmentId;
    }

    const facility = await prisma.facilities.update({
      where: { id },
      data: updateData,
      select: facilitySelect,
    });

    return mapFacility(facility);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.facilities.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMany = async (
  filters: FacilityFilterOptions = {}
): Promise<Facility[]> => {
  try {
    const facilities = await prisma.facilities.findMany({
      where: buildWhereClause(filters),
      select: facilitySelect,
      orderBy: { created_at: 'desc' },
    });

    return facilities.map(mapFacility);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: FacilityFilterOptions,
  pagination: FacilityPaginationOptions
): Promise<PaginatedFacilities> => {
  try {
    const { page, limit, sortBy, sortOrder } = pagination;
    const where = buildWhereClause(filters);
    const orderBy = getOrderBy(sortBy, sortOrder);

    const [records, total] = await Promise.all([
      prisma.facilities.findMany({
        where,
        select: facilitySelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.facilities.count({ where }),
    ]);

    return {
      facilities: records.map(mapFacility),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findById, create, update, deleteById, findMany, findWithPagination };
