import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  TrafficEmergency,
  CreateTrafficEmergencyData,
  UpdateTrafficEmergencyData,
  TrafficEmergencyFilterOptions,
  //PaginationOptions,
  PaginatedTrafficEmergencies,
  TrafficEmerPaginationOptions,
} from '../types';

const findById = async (id: number): Promise<TrafficEmergency | null> => {
  try {
    const emergency = await prisma.traffic_emergencies.findUnique({
      where: { id },
      include: {
        users: true,
        vehicles: true,
      },
    });
    if (!emergency) return null;
    // Ensure geometry field exists on the returned object to satisfy the domain type
    const mapped = {
      ...emergency,
      accident_location: (emergency as any).accident_location ?? null,
    } as TrafficEmergency;
    return mapped;
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (
  data: CreateTrafficEmergencyData
): Promise<TrafficEmergency> => {
  try {
    // Use parameterized point creation to avoid WKT/quoting issues
    const emergency = (await prisma.$queryRaw`
      INSERT INTO traffic_emergencies (
        user_id,
        accident_location,
        destination_hospital,
        status,
        ambulance_vehicle_id,
        created_at
      )
      VALUES (
        ${data.user_id},
        ST_SetSRID(ST_MakePoint(${data.accident_location.longitude}, ${data.accident_location.latitude}), 4326),
        ${data.destination_hospital},
        ${data.status ?? 'pending'},
        ${data.ambulance_vehicle_id ?? null},
        NOW()
      )
      RETURNING *
    `) as TrafficEmergency[];

    const e = emergency[0];
    return {
      ...e,
      accident_location: (e as any).accident_location ?? null,
    } as TrafficEmergency;
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdateTrafficEmergencyData
): Promise<TrafficEmergency> => {
  try {
    const updateData: any = {};

    if (data.destination_hospital !== undefined) {
      updateData.destination_hospital = data.destination_hospital;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.ambulance_vehicle_id !== undefined) {
      updateData.ambulance_vehicle_id = data.ambulance_vehicle_id;
    }

    // If location is provided, use raw query for geometry update
    if (data.accident_location) {
      const emergency = (await prisma.$queryRaw`
        UPDATE traffic_emergencies
        SET
          accident_location = ST_SetSRID(ST_MakePoint(${data.accident_location.longitude}, ${data.accident_location.latitude}), 4326),
          destination_hospital = COALESCE(${data.destination_hospital}, destination_hospital),
          status = COALESCE(${data.status}, status),
          ambulance_vehicle_id = COALESCE(${data.ambulance_vehicle_id}, ambulance_vehicle_id)
        WHERE id = ${id}
        RETURNING *
      `) as TrafficEmergency[];

      const e = emergency[0];
      return {
        ...e,
        accident_location: (e as any).accident_location ?? null,
      } as TrafficEmergency;
    }

    // Regular update without geometry
    const emergency = await prisma.traffic_emergencies.update({
      where: { id },
      data: updateData,
    });
    return {
      ...emergency,
      accident_location: (emergency as any).accident_location ?? null,
    } as TrafficEmergency;
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.traffic_emergencies.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

const findByUser = async (userId: number): Promise<TrafficEmergency[]> => {
  try {
    const emergencies = await prisma.traffic_emergencies.findMany({
      where: { user_id: userId },
      include: {
        vehicles: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return emergencies.map(
      (e) =>
        ({
          ...e,
          accident_location: (e as any).accident_location ?? null,
        }) as TrafficEmergency
    );
  } catch (error) {
    handlePrismaError(error);
  }
};

const findByStatus = async (status: string): Promise<TrafficEmergency[]> => {
  try {
    const emergencies = await prisma.traffic_emergencies.findMany({
      where: { status },
      include: {
        users: true,
        vehicles: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return emergencies.map(
      (e) =>
        ({
          ...e,
          accident_location: (e as any).accident_location ?? null,
        }) as TrafficEmergency
    );
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: TrafficEmergencyFilterOptions,
  pagination: TrafficEmerPaginationOptions
): Promise<PaginatedTrafficEmergencies> => {
  try {
    const { user_id, status, ambulance_vehicle_id, start_date, end_date } =
      filters;
    const { page, limit, sortBy, sortOrder } = pagination;

    const where: any = {};

    if (user_id !== undefined) {
      where.user_id = user_id;
    }

    if (status) {
      where.status = status;
    }

    if (ambulance_vehicle_id !== undefined) {
      where.ambulance_vehicle_id = ambulance_vehicle_id;
    }

    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at.gte = start_date;
      if (end_date) where.created_at.lte = end_date;
    }

    const [emergencies, total] = await Promise.all([
      prisma.traffic_emergencies.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          users: true,
          vehicles: true,
        },
      }),
      prisma.traffic_emergencies.count({ where }),
    ]);

    return {
      emergencies: emergencies.map(
        (e) =>
          ({
            ...e,
            accident_location: (e as any).accident_location ?? null,
          }) as TrafficEmergency
      ),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const getStats = async (): Promise<{
  total_emergencies: number;
  pending: number;
  dispatched: number;
  in_transit: number;
  arrived: number;
  completed: number;
  cancelled: number;
}> => {
  try {
    const [total, statusCounts] = await Promise.all([
      prisma.traffic_emergencies.count(),
      prisma.traffic_emergencies.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const stats: any = {
      total_emergencies: total,
      pending: 0,
      dispatched: 0,
      in_transit: 0,
      arrived: 0,
      completed: 0,
      cancelled: 0,
    };

    type StatusCount = { status: string | null; _count: { status: number } };
    for (const item of statusCounts as StatusCount[]) {
      if (item.status) {
        stats[item.status] = item._count.status;
      }
    }

    return stats;
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findById,
  create,
  update,
  deleteById,
  findByUser,
  findByStatus,
  findWithPagination,
  getStats,
};
