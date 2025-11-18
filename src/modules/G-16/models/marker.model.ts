import prisma from '@/config/client.ts';
import { handlePrismaError, ValidationError } from '@/errors';
import type {
  CreateMarkerTypeInput,
  UpdateMarkerTypeInput,
  MarkerTypeResponse,
} from '../types/markerType.types';
import type {
  CreateMarkerInput,
  MarkerResponse,
  UpdateMarkerInput,
} from '../types/marker.types';
import { PrismaClient } from '@prisma/client';
import type { BoundingBox } from '../types/marker.types';
import type { marker } from '@/generated/prisma';

// const prima = new PrismaClient();
export const createMarker = async (
  data: CreateMarkerInput
): Promise<MarkerResponse> => {
  if (data.location) {
    // 👇 normalize location ให้เป็น GeoJSON เสมอ
    const loc: any = data.location;

    let geoJson: any;
    if (loc.type && loc.coordinates) {
      // กรณี frontend ส่ง GeoJSON มาอยู่แล้ว
      geoJson = loc;
    } else if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      // กรณีเราใช้ { lat, lng } (เช่น detectHarm)
      geoJson = {
        type: 'Point',
        coordinates: [loc.lng, loc.lat], // ⭐ GeoJSON ใช้ [lng, lat]
      };
    } else {
      throw new Error('Invalid location format');
    }

    const result = await prisma.$queryRaw<marker[]>`
      INSERT INTO marker (marker_type_id, description, location)
      VALUES (
        ${data.marker_type_id}::int,
        ${data.description}::text,
        ST_SetSRID(
          ST_GeomFromGeoJSON(${JSON.stringify(geoJson)}),
          4326
        )
      )
      RETURNING *
    `;

    const createdMarker = result[0];

    return (await prisma.marker.findUnique({
      where: { id: createdMarker.id },
      include: { marker_type: true },
    })) as MarkerResponse;
  }

  // กรณีไม่มี location
  return (await prisma.marker.create({
    data: {
      marker_type_id: data.marker_type_id ?? null,
      description: data.description ?? null,
    },
    include: {
      marker_type: true,
    },
  })) as MarkerResponse;
};

export const updateMarker = async (
  id: string,
  data: UpdateMarkerInput
): Promise<MarkerResponse> => {
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    throw new ValidationError('Invalid marker ID');
  }

  try {
    const exists = await prisma.marker.findUnique({
      where: { id: numericId },
    });

    if (!exists) {
      throw new Error(`Marker with ID ${numericId} not found`);
    }

    if (data.location !== undefined) {
      await prisma.$executeRaw`
          UPDATE marker
          SET 
            marker_type_id = COALESCE(${data.marker_type_id}::int, marker_type_id),
            description = COALESCE(${data.description}::text, description),
            location = ST_GeomFromGeoJSON(${JSON.stringify(data.location)}),
            updated_at = NOW()
          WHERE id = ${numericId}
        `;
    } else {
      await prisma.marker.update({
        where: { id: numericId },
        data: {
          marker_type_id: data.marker_type_id,
          description: data.description,
        },
      });
    }

    // ดึงข้อมูลพร้อม relation
    const result = await prisma.marker.findUnique({
      where: { id: numericId },
      include: { marker_type: true },
    });

    if (!result) {
      throw new Error('Marker not found after update');
    }

    return result as MarkerResponse;
  } catch (error: any) {
    console.error('Error in updateMarker:', error);

    // Prisma error code P2025 = Record not found
    if (error.code === 'P2025') {
      throw new Error(`Marker with ID ${numericId} not found`);
    }

    throw error;
  }
};

//getmarker
export const getMarkerById = async (
  id: string
): Promise<MarkerResponse | null> => {
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    throw new ValidationError('Invalid marker ID');
  }

  return (await prisma.marker.findUnique({
    where: { id: numericId },
    include: {
      marker_type: true,
    },
  })) as MarkerResponse | null;
};

// GET all marker
export const getAllMarkers = async (options?: {
  marker_type_id?: number;
  skip?: number;
  take?: number;
}): Promise<MarkerResponse[]> => {
  return (await prisma.marker.findMany({
    where: options?.marker_type_id
      ? { marker_type_id: options.marker_type_id }
      : undefined,
    include: {
      marker_type: true,
    },
    skip: options?.skip,
    take: options?.take,
    orderBy: {
      created_at: 'desc',
    },
  })) as MarkerResponse[];
};

//Delete
export const deleteMarker = async (id: string): Promise<void> => {
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    throw new ValidationError('Invalid marker ID');
  }

  try {
    const exists = await prisma.marker.findUnique({
      where: { id: numericId },
    });

    if (!exists) {
      throw new Error(`Marker with ID ${numericId} not found`);
    }

    await prisma.marker.delete({
      where: { id: numericId },
    });
  } catch (error: any) {
    console.error('Error in deleteMarker:', error);

    // Prisma error code P2025 = Record not found
    if (error.code === 'P2025') {
      throw new Error(`Marker with ID ${numericId} not found`);
    }

    throw error;
  }
};

export const getMarkersWithinBounds = async (
  bounds: BoundingBox
): Promise<MarkerResponse[]> => {
  const markers = await prisma.$queryRaw<any[]>`
      SELECT 
        m.id,
        m.marker_type_id,
        m.description,
        m.location,
        m.created_at,
        m.updated_at,
        json_build_object(
          'id', mt.id,
          'marker_type_icon', mt.marker_type_icon,
          'marker_type_color', mt.marker_type_color,
          'created_at', mt.created_at,
          'updated_at', mt.updated_at
        ) as marker_type
      FROM marker m
      LEFT JOIN marker_type mt ON m.marker_type_id = mt.id
      WHERE m.location IS NOT NULL
        AND ST_X(m.location::geometry) BETWEEN ${bounds.west} AND ${bounds.east}
        AND ST_Y(m.location::geometry) BETWEEN ${bounds.south} AND ${bounds.north}
      ORDER BY m.created_at DESC
    `;

  return markers as MarkerResponse[];
};

export const getMarkersByTypes = async (
  typeIds: number[]
): Promise<MarkerResponse[]> => {
  return (await prisma.marker.findMany({
    where: {
      marker_type_id: {
        in: typeIds,
      },
    },
    include: {
      marker_type: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  })) as MarkerResponse[];
};
