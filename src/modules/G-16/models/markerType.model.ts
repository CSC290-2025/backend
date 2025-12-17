import prisma from '@/config/client.ts';
import type {
    CreateMarkerTypeInput,
    UpdateMarkerTypeInput,
    MarkerTypeResponse,
  } from '../types/markerType.types';
import type { MarkerQuery } from '../types';
  import { handlePrismaError, ValidationError } from '@/errors';

// export const createMarkerType =async (data: CreateMarkerTypeInput): Promise<MarkerTypeResponse> => {
//   try {
//     if (!data.marker_type_id || data.marker_type_id < 1 || data.marker_type_id > 6) {
//       throw new ValidationError('marker_type_id must be between 1 and 6');
//     }

//     // 1. แปลง location (lat, lng) ให้เป็น GeoJSON String
//     let locationGeoJSON = null;
//     if (data.location) {
//       locationGeoJSON = JSON.stringify({
//         type: 'Point',
//         coordinates: [data.location.lng, data.location.lat], // PostGIS ใช้ [lng, lat]
//       });
//     }
    
//     const description = data.description || null; // ใช้ค่าที่ส่งมา หรือ null ถ้าไม่ส่งมา

//     const resultRaw = await prisma.$queryRaw<{ id: number }[]>`
//       INSERT INTO marker (marker_type_id, location, description, updated_at)
//       VALUES (
//         ${data.marker_type_id}, 
//         ST_GeomFromGeoJSON(${locationGeoJSON}),
//         ${description},
//         NOW() // 🟢 FIX: NOW() ควรอยู่ตำแหน่งที่ 4 เพื่อกำหนด updated_at
//       )
//       RETURNING id
//     `;

//     const newId = resultRaw[0].id;
//     const marker = await prisma.marker.findUnique({
//       where: { id: newId },
//       include: {
//         marker_type: {
//           select: {
//             id: true,
//             marker_type_icon: true,
//             marker_type_color: true,
//           },
//         },
//       },
//     });

//     return marker as unknown as MarkerTypeResponse;
//   } catch (error) {
//     console.error("🔴 RAW DB ERROR:", error);
//     handlePrismaError(error);
//   }
// }

export const createMarkerType = async (data: CreateMarkerTypeInput): Promise<MarkerTypeResponse> => {
  
  try {
    if (!data.marker_type_id || data.marker_type_id < 1 || data.marker_type_id > 6) {
      throw new ValidationError('marker_type_id must be between 1 and 6');
    }

    const markerType = await prisma.marker_type.findUnique({
      where: { id: data.marker_type_id },
    });
  
    if (!markerType) {
      throw new ValidationError(`Marker type ${data.marker_type_id} not found`);
    }
  
    let result;

    if (data.location) {
        
      const pointString = `POINT(${data.location.lng} ${data.location.lat})`; 
      
      [result] = await prisma.$queryRaw<any[]>`
        INSERT INTO marker (marker_type_id, location, description, created_at, updated_at)
        VALUES (
          ${data.marker_type_id},
          ST_GeomFromText(${pointString}, 4326), 
          ${data.description || null},
          NOW(), NOW()
        )
        RETURNING id, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng,
                  description, marker_type_id, created_at, updated_at
      `;
  
    } else {
      [result] = await prisma.$queryRaw<any[]>`
        INSERT INTO marker (marker_type_id, location, description, created_at, updated_at)
        VALUES (
          ${data.marker_type_id}, 
          NULL, 
          ${data.description || null}, 
          NOW(), NOW()
        )
        RETURNING id, description, marker_type_id, created_at, updated_at
      `;
    }
    
    const markerTypeData = {
        id: markerType.id,
        marker_type_icon: markerType.marker_type_icon,
        created_at: markerType.created_at,
        updated_at: markerType.updated_at,
    };


    return {
        id: result.id,
        lat: result.lat ? parseFloat(result.lat) : null,
        lng: result.lng ? parseFloat(result.lng) : null,
        description: result.description,
        marker_type_id: result.marker_type_id,
        marker_type: markerTypeData,
        created_at: result.created_at,
        updated_at: result.updated_at,
    } as unknown as MarkerTypeResponse;


  } catch (error) { 
    handlePrismaError(error);
  }
}


export const getMarkerTypeById =async (id: number) : Promise<MarkerTypeResponse | null> => {
  try {
    if (!Number.isInteger(id) || id < 1) {
      throw new ValidationError('Invalid marker ID');
    }

    const marker = await prisma.marker.findUnique({
      where: { id },
      include: {
        marker_type: {
          select: {
            id: true,
            marker_type_icon: true,
          },
        },
      },
    });

    return marker as MarkerTypeResponse | null;
  } catch (error) {
    handlePrismaError(error);
  }
}

export const getAllMarkerTypes = async (query?: MarkerQuery): Promise<MarkerTypeResponse[]> => {
  try {
    const prismaOptions: any = {
      include: {
        marker_type: {
          select: {
            id: true,
            marker_type_icon: true,
          },
        },
      },
      orderBy: {
        [query?.sortBy || 'updated_at']: query?.sortOrder || 'desc',
      },
    };

    if (query?.limit) {
      prismaOptions.take = Number(query.limit);
    }
    if (query?.offset) {
      prismaOptions.skip = Number(query.offset);
    }

    const markers = await prisma.marker.findMany(prismaOptions);

    return markers as unknown as MarkerTypeResponse[];
  } catch (error) {
    handlePrismaError(error);
  }
};



export const getMarkerTypesByType = async (
  markerTypeId: number[]
): Promise<MarkerTypeResponse[]> => {
  try {
    if (!markerTypeId || markerTypeId.length === 0) {
      return []; 
    }

    for (const id of markerTypeId) {
      if (id < 1 || id > 8) { 
        throw new ValidationError('marker_type_id must be between 1 and 8');
      }
    }

    const markers = await prisma.marker.findMany({
      where: {
        marker_type_id:{
          in: markerTypeId,
        } ,
      },
      include: {
        marker_type: {
          select: {
            id: true,
            marker_type_icon: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    return markers as unknown as MarkerTypeResponse[];
  } catch (error) {
  //   if (error instanceof ValidationError) {
  //     throw error; 
  // }
  handlePrismaError(error);
  }
};

export const updateMarkerType = async (
  id: number,
  data: UpdateMarkerTypeInput
): Promise<MarkerTypeResponse> => {
  try {
    // Validate ID
    if (!Number.isInteger(id) || id < 1) {
      throw new ValidationError('Invalid marker ID');
    }

    // Check if marker exists
    const existingMarker = await prisma.marker.findUnique({
      where: { id },
    });

    if (!existingMarker) {
      throw new ValidationError('Marker not found');
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const values: any[] = [];

    if (data.location && 'lat' in data.location && 'lng' in data.location) {
      const locationGeoJSON = JSON.stringify({
        type: 'Point',
        coordinates: [data.location.lng, data.location.lat],
      });
      updateFields.push(`location = ST_GeomFromGeoJSON($${values.length + 1})`);
      values.push(locationGeoJSON);
    }


    // Always update the timestamp
    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 1) {
      // Only updated_at, no actual changes
      throw new ValidationError('No fields to update');
    }

    // Execute raw SQL update
    const query = `
      UPDATE marker 
      SET ${updateFields.join(', ')}
      WHERE id = $${values.length + 1}
      RETURNING id
    `;
    values.push(id);

    await prisma.$queryRawUnsafe(query, ...values);

    // Fetch updated marker
    const updatedMarker = await prisma.marker.findUnique({
      where: { id },
      include: {
        marker_type: {
          select: {
            id: true,
            marker_type_icon: true,
          },
        },
      },
    });

    return updatedMarker as unknown as MarkerTypeResponse;
  } catch (error) {
    handlePrismaError(error);
  }
};

export const deleteMarkerType = async (id: number): Promise<void> => {
  try {
    // Validate ID
    if (!Number.isInteger(id) || id < 1) {
      throw new ValidationError('Invalid marker ID');
    }
    const existingMarker = await prisma.marker.findUnique({
      where: { id },
    });

    if (!existingMarker) {
      throw new ValidationError('Marker not found');
    }

    await prisma.marker.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export const getMarkerTypesInBounds = async (bounds: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  markerTypeIds?: number[];
}): Promise<MarkerTypeResponse[]> => {
  try {
    const { minLat, maxLat, minLng, maxLng, markerTypeIds } = bounds;

    // Create a polygon representing the bounding box
    const bboxPolygon = JSON.stringify({
      type: 'Polygon',
      coordinates: [
        [
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat],
        ],
      ],
    });

    // Build the WHERE clause for marker types if provided
    let markerTypeFilter = '';
    if (markerTypeIds && markerTypeIds.length > 0) {
      const ids = markerTypeIds.join(',');
      markerTypeFilter = `AND m.marker_type_id IN (${ids})`;
    }

    const markers = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        m.id,
        m.marker_type_id,
        m.description,
        m.created_at,
        m.updated_at,
        ST_AsGeoJSON(m.location) as location,
        mt.marker_type_icon,
      FROM marker m
      LEFT JOIN marker_type mt ON m.marker_type_id = mt.id
      WHERE ST_Within(
        m.location,
        ST_GeomFromGeoJSON('${bboxPolygon}')
      )
      ${markerTypeFilter}
      ORDER BY m.updated_at DESC
    `);
    return markers.map((marker) => ({
      id: marker.id,
      marker_type_id: marker.marker_type_id,
      description: marker.description,
      created_at: marker.created_at,
      updated_at: marker.updated_at,
      location: marker.location ? JSON.parse(marker.location) : null,
      marker_type: {
        id: marker.marker_type_id,
        marker_type_icon: marker.marker_type_icon,
      },
    })) as unknown as MarkerTypeResponse[];
  } catch (error) {
    handlePrismaError(error);
  }
};