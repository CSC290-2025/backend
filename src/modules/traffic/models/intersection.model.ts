// source/models/intersection.model.ts
import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  Intersection,
  CreateIntersectionData,
  UpdateIntersectionData,
  IntersectionWithLights,
  Location,
} from '../types';

// Helper to parse PostGIS Point to GeoJSON
const parseLocation = (geom: any): Location | null => {
  if (!geom) return null;
  if (typeof geom === 'object' && geom.coordinates) return geom;
  if (typeof geom === 'string') {
    try {
      return JSON.parse(geom);
    } catch {
      return null;
    }
  }
  return null;
};

// Helper to create PostGIS Point
const createPoint = (longitude: number, latitude: number): string => {
  return `POINT(${longitude} ${latitude})`;
};

const findById = async (id: number): Promise<Intersection | null> => {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        ST_AsGeoJSON(location)::json as location
      FROM intersections
      WHERE id = ${id}
    `;

    if (result.length === 0) return null;

    const intersection = result[0];
    return {
      id: intersection.id,
      location: parseLocation(intersection.location),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const findByIdWithLights = async (
  id: number
): Promise<IntersectionWithLights | null> => {
  try {
    // Get intersection
    const intersectionResult = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        ST_AsGeoJSON(location)::json as location
      FROM intersections
      WHERE id = ${id}
    `;

    if (intersectionResult.length === 0) return null;

    const intersection = intersectionResult[0];

    // Get traffic lights
    const lightsResult = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        status,
        current_color,
        density_level,
        auto_mode,
        ip_address,
        ST_AsGeoJSON(location)::json as location
      FROM traffic_lights
      WHERE intersection_id = ${id}
    `;

    // Get roads starting from this intersection
    const roadsStartResult = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        name,
        length_meters
      FROM roads
      WHERE start_intersection_id = ${id}
    `;

    // Get roads ending at this intersection
    const roadsEndResult = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        name,
        length_meters
      FROM roads
      WHERE end_intersection_id = ${id}
    `;

    const lights = lightsResult.map((l: any) => ({
      id: l.id,
      status: l.status,
      current_color: l.current_color,
      density_level: l.density_level,
      auto_mode: l.auto_mode,
      ip_address: l.ip_address,
      location: parseLocation(l.location),
    }));

    // Calculate stats
    const totalLights = lights.length;
    const activeLights = lights.filter((l: any) => l.status === 1).length;
    const avgDensity =
      totalLights > 0
        ? lights.reduce(
            (sum: number, l: any) => sum + (l.density_level || 0),
            0
          ) / totalLights
        : 0;

    return {
      id: intersection.id,
      location: parseLocation(intersection.location),
      traffic_lights: lights,
      roads_starting: roadsStartResult,
      roads_ending: roadsEndResult,
      stats: {
        totalLights,
        activeLights,
        averageDensity: Math.round(avgDensity * 10) / 10,
        totalRoads: roadsStartResult.length + roadsEndResult.length,
      },
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const findAll = async (filters?: {
  min_lights?: number;
  max_lights?: number;
  has_roads?: boolean;
}): Promise<Intersection[]> => {
  try {
    const havingClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.min_lights) {
      havingClauses.push(`COUNT(tl.id) >= $${paramIndex++}`);
      params.push(filters.min_lights);
    }

    if (filters?.max_lights) {
      havingClauses.push(`COUNT(tl.id) <= $${paramIndex++}`);
      params.push(filters.max_lights);
    }

    const havingClause =
      havingClauses.length > 0 ? `HAVING ${havingClauses.join(' AND ')}` : '';

    let whereClause = '';
    if (filters?.has_roads !== undefined) {
      if (filters.has_roads) {
        whereClause = `WHERE (
          EXISTS (SELECT 1 FROM roads WHERE start_intersection_id = i.id)
          OR EXISTS (SELECT 1 FROM roads WHERE end_intersection_id = i.id)
        )`;
      } else {
        whereClause = `WHERE NOT (
          EXISTS (SELECT 1 FROM roads WHERE start_intersection_id = i.id)
          OR EXISTS (SELECT 1 FROM roads WHERE end_intersection_id = i.id)
        )`;
      }
    }

    const query = `
      SELECT 
        i.id,
        ST_AsGeoJSON(i.location)::json as location
      FROM intersections i
      LEFT JOIN traffic_lights tl ON tl.intersection_id = i.id
      ${whereClause}
      GROUP BY i.id
      ${havingClause}
      ORDER BY i.id DESC
    `;

    const result = await prisma.$queryRawUnsafe<any[]>(query, ...params);

    return result.map((i) => ({
      id: i.id,
      location: parseLocation(i.location),
    }));
  } catch (error) {
    handlePrismaError(error);
  }
};

const findAllWithLights = async (filters?: {
  min_lights?: number;
  max_lights?: number;
  has_roads?: boolean;
}): Promise<IntersectionWithLights[]> => {
  try {
    // First get filtered intersection IDs
    const intersections = await findAll(filters);

    // Then get full details for each
    const results: IntersectionWithLights[] = [];
    for (const intersection of intersections) {
      const full = await findByIdWithLights(intersection.id);
      if (full) {
        results.push(full);
      }
    }

    return results;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findNearby = async (
  longitude: number,
  latitude: number,
  radiusMeters: number = 5000
): Promise<Intersection[]> => {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        ST_AsGeoJSON(location)::json as location,
        ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) as distance
      FROM intersections
      WHERE ST_DWithin(
        location::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusMeters}
      )
      ORDER BY distance ASC
    `;

    return result.map((i) => ({
      id: i.id,
      location: parseLocation(i.location),
    }));
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateIntersectionData): Promise<Intersection> => {
  try {
    const point = createPoint(
      data.location.coordinates[0],
      data.location.coordinates[1]
    );

    const result = await prisma.$queryRaw<any[]>`
      INSERT INTO intersections (location)
      VALUES (ST_GeomFromText(${point}, 4326))
      RETURNING 
        id,
        ST_AsGeoJSON(location)::json as location
    `;

    const intersection = result[0];
    return {
      id: intersection.id,
      location: parseLocation(intersection.location),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdateIntersectionData
): Promise<Intersection> => {
  try {
    const point = createPoint(
      data.location.coordinates[0],
      data.location.coordinates[1]
    );

    const result = await prisma.$queryRaw<any[]>`
      UPDATE intersections
      SET location = ST_GeomFromText(${point}, 4326)
      WHERE id = ${id}
      RETURNING 
        id,
        ST_AsGeoJSON(location)::json as location
    `;

    const intersection = result[0];
    return {
      id: intersection.id,
      location: parseLocation(intersection.location),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    // Check if any traffic lights are attached
    const lights = await prisma.$queryRaw<any[]>`
      SELECT id FROM traffic_lights WHERE intersection_id = ${id}
    `;

    if (lights.length > 0) {
      throw new Error(
        `Cannot delete intersection with ${lights.length} traffic lights attached. ` +
          'Delete traffic lights first.'
      );
    }

    // Check if any roads are attached
    const roads = await prisma.$queryRaw<any[]>`
      SELECT id FROM roads 
      WHERE start_intersection_id = ${id} OR end_intersection_id = ${id}
    `;

    if (roads.length > 0) {
      throw new Error(
        `Cannot delete intersection with ${roads.length} roads attached. ` +
          'Delete or reassign roads first.'
      );
    }

    await prisma.$executeRaw`DELETE FROM intersections WHERE id = ${id}`;
  } catch (error) {
    handlePrismaError(error);
  }
};

const count = async (): Promise<number> => {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int as count FROM intersections
    `;
    return result[0].count;
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findById,
  findByIdWithLights,
  findAll,
  findAllWithLights,
  findNearby,
  create,
  update,
  deleteById,
  count,
};
