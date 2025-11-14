import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  Road,
  CreateRoadData,
  UpdateRoadData,
  RoadFilterOptions,
  PaginationOptions,
  PaginatedRoads,
} from '../types';

// Helper to map Prisma DB rows (which may contain nullable fields)
// into the domain `Road` shape expected by the rest of the app.
const mapDbRoadToRoad = (dbRoad: any): Road => {
  if (!dbRoad) return dbRoad;

  // Coalesce nullable DB values into safe domain values.
  // - `name` may be nullable in the DB/schema; make it a string here.
  // - `length_meters` may be nullable; coalesce to 0.
  // Keep other fields as-is (they may be nullable in the domain schema).
  return {
    ...dbRoad,
    name: dbRoad.name ?? '',
    length_meters: dbRoad.length_meters ?? 0,
  } as Road;
};

const findById = async (id: number): Promise<Road | null> => {
  try {
    const road = await prisma.roads.findUnique({
      where: { id },
      include: {
        intersections_roads_start_intersection_idTointersections: true,
        intersections_roads_end_intersection_idTointersections: true,
      },
    });
    if (!road) return null;
    return mapDbRoadToRoad(road);
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateRoadData): Promise<Road> => {
  try {
    const road = await prisma.roads.create({
      data: {
        name: data.name,
        start_intersection_id: data.start_intersection_id,
        end_intersection_id: data.end_intersection_id,
        length_meters: data.length_meters || null,
      },
    });
    return mapDbRoadToRoad(road);
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (id: number, data: UpdateRoadData): Promise<Road> => {
  try {
    const road = await prisma.roads.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.start_intersection_id !== undefined && {
          start_intersection_id: data.start_intersection_id,
        }),
        ...(data.end_intersection_id !== undefined && {
          end_intersection_id: data.end_intersection_id,
        }),
        ...(data.length_meters !== undefined && {
          length_meters: data.length_meters,
        }),
      },
    });
    return mapDbRoadToRoad(road);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.roads.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

const findByIntersection = async (intersectionId: number): Promise<Road[]> => {
  try {
    const roads = await prisma.roads.findMany({
      where: {
        OR: [
          { start_intersection_id: intersectionId },
          { end_intersection_id: intersectionId },
        ],
      },
    });
    return roads.map(mapDbRoadToRoad);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: RoadFilterOptions,
  pagination: PaginationOptions
): Promise<PaginatedRoads> => {
  try {
    const {
      name,
      start_intersection_id,
      end_intersection_id,
      min_length,
      max_length,
    } = filters;
    const { page, limit, sortBy, sortOrder } = pagination;

    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (start_intersection_id !== undefined) {
      where.start_intersection_id = start_intersection_id;
    }

    if (end_intersection_id !== undefined) {
      where.end_intersection_id = end_intersection_id;
    }

    if (min_length !== undefined || max_length !== undefined) {
      where.length_meters = {};
      if (min_length !== undefined) where.length_meters.gte = min_length;
      if (max_length !== undefined) where.length_meters.lte = max_length;
    }

    const [roads, total] = await Promise.all([
      prisma.roads.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.roads.count({ where }),
    ]);

    return {
      roads: roads.map(mapDbRoadToRoad),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const getStats = async (): Promise<{
  total_roads: number;
  total_length: number;
  avg_length: number;
  min_length: number;
  max_length: number;
}> => {
  try {
    const [count, aggregate] = await Promise.all([
      prisma.roads.count(),
      prisma.roads.aggregate({
        _sum: { length_meters: true },
        _avg: { length_meters: true },
        _min: { length_meters: true },
        _max: { length_meters: true },
      }),
    ]);

    return {
      total_roads: count,
      total_length: aggregate._sum.length_meters || 0,
      avg_length: aggregate._avg.length_meters || 0,
      min_length: aggregate._min.length_meters || 0,
      max_length: aggregate._max.length_meters || 0,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findById,
  create,
  update,
  deleteById,
  findByIntersection,
  findWithPagination,
  getStats,
};
