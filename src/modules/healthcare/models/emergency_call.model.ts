import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
import type {
  EmergencyCall,
  CreateEmergencyCallData,
  UpdateEmergencyCallData,
  EmergencyCallFilterOptions,
  EmergencyCallPaginationOptions,
  PaginatedEmergencyCalls,
} from '../types';

const emergencyCallSelect = {
  id: true,
  patient_id: true,
  caller_phone: true,
  emergency_type: true,
  severity: true,
  address_id: true,
  ambulance_id: true,
  facility_id: true,
  status: true,
  created_at: true,
} satisfies Prisma.emergency_callsSelect;

type EmergencyCallRecord = Prisma.emergency_callsGetPayload<{
  select: typeof emergencyCallSelect;
}>;

const mapEmergencyCall = (record: EmergencyCallRecord): EmergencyCall => ({
  id: record.id,
  patientId: record.patient_id ?? null,
  callerPhone: record.caller_phone ?? null,
  emergencyType: record.emergency_type,
  severity: record.severity ?? null,
  addressId: record.address_id ?? null,
  ambulanceId: record.ambulance_id ?? null,
  facilityId: record.facility_id ?? null,
  status: record.status ?? null,
  createdAt: record.created_at,
});

const buildWhereClause = (
  filters: EmergencyCallFilterOptions = {}
): Prisma.emergency_callsWhereInput => {
  const where: Prisma.emergency_callsWhereInput = {};

  if (filters.patientId !== undefined) {
    where.patient_id = filters.patientId;
  }

  if (filters.severity) {
    where.severity = filters.severity;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.emergencyType) {
    where.emergency_type = {
      equals: filters.emergencyType,
      mode: 'insensitive',
    };
  }

  if (filters.ambulanceId !== undefined) {
    where.ambulance_id = filters.ambulanceId;
  }

  if (filters.facilityId !== undefined) {
    where.facility_id = filters.facilityId;
  }

  if (filters.search) {
    const term = filters.search.trim();
    if (term.length > 0) {
      where.OR = [
        {
          caller_phone: {
            contains: term,
            mode: 'insensitive',
          },
        },
        {
          emergency_type: {
            contains: term,
            mode: 'insensitive',
          },
        },
        {
          status: {
            contains: term,
            mode: 'insensitive',
          },
        },
      ];
    }
  }

  return where;
};

const getOrderBy = (
  sortBy: EmergencyCallPaginationOptions['sortBy'],
  sortOrder: EmergencyCallPaginationOptions['sortOrder']
): Prisma.emergency_callsOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'createdAt':
    default:
      return { created_at: sortOrder };
  }
};

const findById = async (id: number): Promise<EmergencyCall | null> => {
  try {
    const record = await prisma.emergency_calls.findUnique({
      where: { id },
      select: emergencyCallSelect,
    });

    return record ? mapEmergencyCall(record) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMany = async (
  filters: EmergencyCallFilterOptions = {}
): Promise<EmergencyCall[]> => {
  try {
    const records = await prisma.emergency_calls.findMany({
      where: buildWhereClause(filters),
      select: emergencyCallSelect,
      orderBy: { created_at: 'desc' },
    });

    return records.map(mapEmergencyCall);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: EmergencyCallFilterOptions,
  pagination: EmergencyCallPaginationOptions
): Promise<PaginatedEmergencyCalls> => {
  try {
    const { page, limit, sortBy, sortOrder } = pagination;
    const where = buildWhereClause(filters);
    const orderBy = getOrderBy(sortBy, sortOrder);

    const [records, total] = await Promise.all([
      prisma.emergency_calls.findMany({
        where,
        select: emergencyCallSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.emergency_calls.count({ where }),
    ]);

    return {
      emergencyCalls: records.map(mapEmergencyCall),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (
  data: CreateEmergencyCallData
): Promise<EmergencyCall> => {
  try {
    const record = await prisma.emergency_calls.create({
      data: {
        patient_id: data.patientId ?? null,
        caller_phone: data.callerPhone ?? null,
        emergency_type: data.emergencyType,
        severity: data.severity ?? null,
        address_id: data.addressId ?? null,
        ambulance_id: data.ambulanceId ?? null,
        facility_id: data.facilityId ?? null,
        status: data.status ?? null,
      },
      select: emergencyCallSelect,
    });

    return mapEmergencyCall(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdateEmergencyCallData
): Promise<EmergencyCall> => {
  try {
    const updateData: Prisma.emergency_callsUncheckedUpdateInput = {};

    if (data.patientId !== undefined) {
      updateData.patient_id = data.patientId ?? null;
    }

    if (data.callerPhone !== undefined) {
      updateData.caller_phone = data.callerPhone ?? null;
    }

    if (data.emergencyType !== undefined) {
      updateData.emergency_type = data.emergencyType;
    }

    if (data.severity !== undefined) {
      updateData.severity = data.severity ?? null;
    }

    if (data.addressId !== undefined) {
      updateData.address_id = data.addressId ?? null;
    }

    if (data.ambulanceId !== undefined) {
      updateData.ambulance_id = data.ambulanceId ?? null;
    }

    if (data.facilityId !== undefined) {
      updateData.facility_id = data.facilityId ?? null;
    }

    if (data.status !== undefined) {
      updateData.status = data.status ?? null;
    }

    const record = await prisma.emergency_calls.update({
      where: { id },
      data: updateData,
      select: emergencyCallSelect,
    });

    return mapEmergencyCall(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.emergency_calls.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findById, findMany, findWithPagination, create, update, deleteById };
