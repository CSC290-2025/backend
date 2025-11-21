import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  TrafficLight,
  CreateTrafficLightData,
  UpdateTrafficLightData,
} from '../types';

// ...existing code...

// Helper function to convert lat/lng to location object
const createLocation = (
  latitude: number | null,
  longitude: number | null
): { type: 'Point'; coordinates: [number, number] } | null => {
  if (latitude === null || longitude === null) return null;
  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
};

// ---------------------- FIND BY ID ----------------------
const findById = async (id: number): Promise<TrafficLight | null> => {
  try {
    const result = await prisma.$queryRaw<any[]>`SELECT
        id,
        intersection_id,
        road_id,
        ip_address,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        status,
        current_color,
        density_level,
        auto_mode,
        green_duration,
        red_duration,
        last_color,
        last_updated
      FROM traffic_lights
      WHERE id = ${id};`;

    const tl = result[0];
    if (!tl) return null;

    return {
      id: tl.id,
      intersection_id: tl.intersection_id,
      road_id: tl.road_id,
      ip_address: tl.ip_address,
      location: createLocation(tl.latitude, tl.longitude),
      status: tl.status,
      current_color: tl.current_color,
      density_level: tl.density_level,
      auto_mode: tl.auto_mode,
      green_duration: tl.green_duration,
      red_duration: tl.red_duration,
      last_color: tl.last_color,
      last_updated: tl.last_updated?.toISOString() || null,
    };
  } catch (error) {
    handlePrismaError(error);
    throw error;
  }
};

// ---------------------- FIND ALL ----------------------
const findAll = async (filters?: {
  intersection_id?: number;
  road_id?: number;
  status?: number;
  auto_mode?: boolean;
  min_density?: number;
  max_density?: number;
}): Promise<TrafficLight[]> => {
  try {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.intersection_id) {
      params.push(filters.intersection_id);
      conditions.push(`intersection_id = $${params.length}`);
    }
    if (filters?.road_id) {
      params.push(filters.road_id);
      conditions.push(`road_id = $${params.length}`);
    }
    if (filters?.status !== undefined) {
      params.push(filters.status);
      conditions.push(`status = $${params.length}`);
    }
    if (filters?.auto_mode !== undefined) {
      params.push(filters.auto_mode);
      conditions.push(`auto_mode = $${params.length}`);
    }
    if (filters?.min_density) {
      params.push(filters.min_density);
      conditions.push(`density_level >= $${params.length}`);
    }
    if (filters?.max_density) {
      params.push(filters.max_density);
      conditions.push(`density_level <= $${params.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT
        id,
        intersection_id,
        road_id,
        ip_address,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        status,
        current_color,
        density_level,
        auto_mode,
        green_duration,
        red_duration,
        last_color,
        last_updated
      FROM traffic_lights
      ${whereClause}
      ORDER BY last_updated DESC;
    `,
      ...params
    );

    return result.map((tl) => ({
      id: tl.id,
      intersection_id: tl.intersection_id,
      road_id: tl.road_id,
      ip_address: tl.ip_address,
      location: createLocation(tl.latitude, tl.longitude),
      status: tl.status,
      current_color: tl.current_color,
      density_level: tl.density_level,
      auto_mode: tl.auto_mode,
      green_duration: tl.green_duration,
      red_duration: tl.red_duration,
      last_color: tl.last_color,
      last_updated: tl.last_updated?.toISOString() || null,
    }));
  } catch (error) {
    handlePrismaError(error);
    return [];
  }
};

// ---------------------- FIND BY INTERSECTION ----------------------
const findByIntersection = async (
  intersection_id: number
): Promise<TrafficLight[]> => {
  try {
    const result = await prisma.$queryRaw<any[]>`SELECT
        id,
        intersection_id,
        road_id,
        ip_address,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        status,
        current_color,
        density_level,
        auto_mode,
        green_duration,
        red_duration,
        last_color,
        last_updated
      FROM traffic_lights
      WHERE intersection_id = ${intersection_id}
      ORDER BY id ASC;`;

    return result.map((tl) => ({
      id: tl.id,
      intersection_id: tl.intersection_id,
      road_id: tl.road_id,
      ip_address: tl.ip_address,
      location: createLocation(tl.latitude, tl.longitude),
      status: tl.status,
      current_color: tl.current_color,
      density_level: tl.density_level,
      auto_mode: tl.auto_mode,
      green_duration: tl.green_duration,
      red_duration: tl.red_duration,
      last_color: tl.last_color,
      last_updated: tl.last_updated?.toISOString() || null,
    }));
  } catch (error) {
    handlePrismaError(error);
    return [];
  }
};

// ---------------------- FIND BY ROAD ----------------------
const findByRoad = async (road_id: number): Promise<TrafficLight[]> => {
  try {
    const result = await prisma.$queryRaw<any[]>`SELECT
        id,
        intersection_id,
        road_id,
        ip_address,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        status,
        current_color,
        density_level,
        auto_mode,
        green_duration,
        red_duration,
        last_color,
        last_updated
      FROM traffic_lights
      WHERE road_id = ${road_id}
      ORDER BY id ASC;`;

    return result.map((tl) => ({
      id: tl.id,
      intersection_id: tl.intersection_id,
      road_id: tl.road_id,
      ip_address: tl.ip_address,
      location: createLocation(tl.latitude, tl.longitude),
      status: tl.status,
      current_color: tl.current_color,
      density_level: tl.density_level,
      auto_mode: tl.auto_mode,
      green_duration: tl.green_duration,
      red_duration: tl.red_duration,
      last_color: tl.last_color,
      last_updated: tl.last_updated?.toISOString() || null,
    }));
  } catch (error) {
    handlePrismaError(error);
    return [];
  }
};

// ---------------------- CREATE ----------------------
const create = async (data: CreateTrafficLightData): Promise<TrafficLight> => {
  try {
    const locationValue = data.location
      ? `ST_SetSRID(ST_MakePoint(${data.location.coordinates[0]}, ${data.location.coordinates[1]}), 4326)`
      : 'NULL';

    const greenVal =
      data.green_duration !== undefined && data.green_duration !== null
        ? data.green_duration
        : 'NULL';
    const redVal =
      data.red_duration !== undefined && data.red_duration !== null
        ? data.red_duration
        : 'NULL';
    const lastColorVal =
      data.last_color !== undefined && data.last_color !== null
        ? data.last_color
        : 'NULL';

    const result = await prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO traffic_lights (
        intersection_id,
        road_id,
        ip_address,
        location,
        status,
        current_color,
        density_level,
        auto_mode,
        green_duration,
        red_duration,
        last_color
      )
      VALUES (
        ${data.intersection_id},
        ${data.road_id},
        ${data.ip_address ? `'${data.ip_address}'` : 'NULL'},
        ${locationValue},
        ${data.status ?? 0},
        1,
        1,
        ${data.auto_mode ?? true},
        ${greenVal},
        ${redVal},
        ${lastColorVal}
      )
      RETURNING
        id,
        intersection_id,
        road_id,
        ip_address,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        status,
        current_color,
        density_level,
        auto_mode,
        green_duration,
        red_duration,
        last_color,
        last_updated;
    `);

    const tl = result[0];
    if (!tl) {
      throw new Error('Failed to create traffic light');
    }

    return {
      id: tl.id,
      intersection_id: tl.intersection_id,
      road_id: tl.road_id,
      ip_address: tl.ip_address,
      location: createLocation(tl.latitude, tl.longitude),
      status: tl.status,
      current_color: tl.current_color,
      density_level: tl.density_level,
      auto_mode: tl.auto_mode,
      green_duration: tl.green_duration,
      red_duration: tl.red_duration,
      last_color: tl.last_color,
      last_updated: tl.last_updated?.toISOString() || null,
    };
  } catch (error) {
    handlePrismaError(error);
    throw error;
  }
};

// ---------------------- UPDATE ----------------------
const update = async (
  id: number,
  data: UpdateTrafficLightData
): Promise<TrafficLight> => {
  try {
    const updates: string[] = [];

    if (data.status !== undefined) updates.push(`status = ${data.status}`);
    if (data.current_color !== undefined)
      updates.push(`current_color = ${data.current_color}`);
    if (data.auto_mode !== undefined)
      updates.push(`auto_mode = ${data.auto_mode}`);
    if (data.ip_address !== undefined)
      updates.push(
        `ip_address = ${data.ip_address ? `'${data.ip_address}'` : 'NULL'}`
      );
    if (data.location !== undefined) {
    }
    if (data.density_level !== undefined)
      updates.push(`density_level = ${data.density_level}`);

    // new updateable fields
    if (data.green_duration !== undefined)
      updates.push(`green_duration = ${data.green_duration}`);
    if (data.red_duration !== undefined)
      updates.push(`red_duration = ${data.red_duration}`);
    if (data.last_color !== undefined)
      updates.push(`last_color = ${data.last_color}`);

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    const result = await prisma.$queryRawUnsafe<any[]>(`
      UPDATE traffic_lights
      SET ${updates.join(', ')}
      WHERE id = ${id}
      RETURNING
        id,
        intersection_id,
        road_id,
        ip_address,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        status,
        current_color,
        density_level,
        auto_mode,
        green_duration,
        red_duration,
        last_color,
        last_updated;
    `);

    const tl = result[0];
    if (!tl) {
      throw new Error('Traffic light not found');
    }

    return {
      id: tl.id,
      intersection_id: tl.intersection_id,
      road_id: tl.road_id,
      ip_address: tl.ip_address,
      location: createLocation(tl.latitude, tl.longitude),
      status: tl.status,
      current_color: tl.current_color,
      density_level: tl.density_level,
      auto_mode: tl.auto_mode,
      green_duration: tl.green_duration,
      red_duration: tl.red_duration,
      last_color: tl.last_color,
      last_updated: tl.last_updated?.toISOString() || null,
    };
  } catch (error) {
    handlePrismaError(error);
    throw error;
  }
};

// ---------------------- UPDATE DENSITY ----------------------
const updateDensity = async (
  id: number,
  density_level: number,
  current_color?: number
): Promise<TrafficLight> => {
  try {
    const result = await prisma.$queryRaw<any[]>`UPDATE traffic_lights
      SET
        density_level = ${density_level},
        current_color = COALESCE(${current_color}, current_color)
      WHERE id = ${id}
      RETURNING
        id,
        intersection_id,
        road_id,
        ip_address,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        status,
        current_color,
        density_level,
        auto_mode,
        green_duration,
        red_duration,
        last_color,
        last_updated;`;

    const tl = result[0];
    if (!tl) {
      throw new Error('Traffic light not found');
    }

    return {
      id: tl.id,
      intersection_id: tl.intersection_id,
      road_id: tl.road_id,
      ip_address: tl.ip_address,
      location: createLocation(tl.latitude, tl.longitude),
      status: tl.status,
      current_color: tl.current_color,
      density_level: tl.density_level,
      auto_mode: tl.auto_mode,
      green_duration: tl.green_duration,
      red_duration: tl.red_duration,
      last_color: tl.last_color,
      last_updated: tl.last_updated?.toISOString() || null,
    };
  } catch (error) {
    handlePrismaError(error);
    throw error;
  }
};

// ---------------------- UPDATE COLOR ----------------------
const updateColor = async (
  id: number,
  color: number
): Promise<TrafficLight | null> => {
  try {
    const result = await prisma.$queryRaw<any[]>`UPDATE traffic_lights
      SET
        current_color = ${color},
        last_color = ${color}
      WHERE id = ${id}
      RETURNING
        id,
        intersection_id,
        road_id,
        ip_address,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        status,
        current_color,
        density_level,
        auto_mode,
        green_duration,
        red_duration,
        last_color,
        last_updated;`;

    const tl = result[0];
    if (!tl) return null;

    return {
      id: tl.id,
      intersection_id: tl.intersection_id,
      road_id: tl.road_id,
      ip_address: tl.ip_address,
      location: createLocation(tl.latitude, tl.longitude),
      status: tl.status,
      current_color: tl.current_color,
      density_level: tl.density_level,
      auto_mode: tl.auto_mode,
      green_duration: tl.green_duration,
      red_duration: tl.red_duration,
      last_color: tl.last_color,
      last_updated: tl.last_updated?.toISOString() || null,
    };
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

// ---------------------- DELETE ----------------------
const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.$executeRaw`DELETE FROM traffic_lights WHERE id = ${id};`;
  } catch (error) {
    handlePrismaError(error);
    throw error;
  }
};

// ---------------------- COUNT ----------------------
const count = async (filters?: {
  intersection_id?: number;
  road_id?: number;
  status?: number;
  auto_mode?: boolean;
}): Promise<number> => {
  try {
    const conditions: string[] = [];
    if (filters?.intersection_id)
      conditions.push(`intersection_id = ${filters.intersection_id}`);
    if (filters?.road_id) conditions.push(`road_id = ${filters.road_id}`);
    if (filters?.status !== undefined)
      conditions.push(`status = ${filters.status}`);
    if (filters?.auto_mode !== undefined)
      conditions.push(`auto_mode = ${filters.auto_mode}`);

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(`
      SELECT COUNT(*)::bigint AS count FROM traffic_lights ${whereClause};
    `);

    return Number(result[0]?.count || 0);
  } catch (error) {
    handlePrismaError(error);
    return 0;
  }
};

// ---------------------- LIST ALL TRAFFIC STATUS ----------------------
const listAllTrafficStatus = async (): Promise<
  Array<{
    id: number;
    status: number | null;
    statusLabel: string;
    intersection_id: number | null;
    road_id: number | null;
    current_color: number;
    location: { type: 'Point'; coordinates: [number, number] } | null;
    last_updated: string | null;
  }>
> => {
  try {
    const result = await prisma.$queryRawUnsafe<any[]>(
      `SELECT
        id,
        status,
        intersection_id,
        road_id,
        current_color,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        last_updated
      FROM traffic_lights
      ORDER BY id ASC;`
    );

    return result.map((tl) => {
      let statusLabel = 'NORMAL';
      if (tl.status === 1) statusLabel = 'BROKEN';
      else if (tl.status === 2) statusLabel = 'MAINTENANCE';

      return {
        id: tl.id,
        status: tl.status ?? 0,
        statusLabel,
        intersection_id: tl.intersection_id,
        road_id: tl.road_id,
        current_color: tl.current_color,
        location: createLocation(tl.latitude, tl.longitude),
        last_updated: tl.last_updated?.toISOString() || null,
      };
    });
  } catch (error) {
    handlePrismaError(error);
    return [];
  }
};

export {
  findById,
  findAll,
  findByIntersection,
  findByRoad,
  create,
  update,
  updateDensity,
  updateColor,
  deleteById,
  count,
  listAllTrafficStatus,
};
