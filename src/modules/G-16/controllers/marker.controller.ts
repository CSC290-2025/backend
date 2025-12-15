import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import * as MarkerService from '@/modules/G-16/services/marker.service';

import type {
  CreateMarkerInput,
  UpdateMarkerInput,
  MarkerQuery,
  BoundingBox,
} from '@/modules/G-16/types';

// GET /api/markers
export const getAllMarkers = async (c: Context) => {
  const query = c.req.query();
    
    const filters: Partial<MarkerQuery> = {
      marker_type_id: query.marker_type_id
        ? Number(query.marker_type_id)
        : undefined,
        
      marker_type_ids: query.marker_type_ids
        ? query.marker_type_ids.split(',').map(Number)
        : undefined,
        
      limit: query.limit ? Number(query.limit) : 100,
      offset: query.offset ? Number(query.offset) : 0,
      
      sortBy: query.sortBy as MarkerQuery['sortBy'],
      sortOrder: query.sortOrder as MarkerQuery['sortOrder'],
    };

    const markers = await MarkerService.getAllMarkers(filters as MarkerQuery);


    return successResponse(
      c, 
      {
        markers: markers, 
        count: markers.length,
        filters: filters, 
      }, 
      200, 
      'Markers retrieved successfully.'
    );
};

export const getMarkerById = async (c: Context) => {
  const id = c.req.param('id');
    const marker = await MarkerService.getMarker(id);

    if (!marker) {
      return c.json(
        {
          success: false,
          message: 'Marker not found',
        },
        404
      );
    }
    return successResponse(
      c, 
      {marker}, 
      200, 
      'Marker retrieved successfully.'
    );
};

export const createMarker = async (c: Context) => {
  const markerData = await c.req.json<CreateMarkerInput>();

    const newMarker = await MarkerService.addtheMarker(markerData);
    return successResponse(
      c,
      {
        marker: newMarker, 
      },
      201, // 201 Created status code
      'Marker created successfully'
    );
};

// PUT /api/markers/:id

export const updateMarker = async (c: Context) => {
  const id = c.req.param('id');
    const markerData = await c.req.json<UpdateMarkerInput>();

    const updatedMarker = await MarkerService.updateMarker(id, markerData);
    return successResponse(
      c,
      {
        marker: updatedMarker, 
      },
      200, 
      'Marker updated successfully'
    );
};

//Delete Marker
export const deleteMarker = async (c: Context) => {
    const id = c.req.param('id');
    await MarkerService.deleteMarker(id);
    return successResponse(
      c,
      null, 
      200, 
      'Marker deleted successfully'
    );
};

// GET /api/markers/bounds
export const getMarkersByBounds = async (c: Context) => {
    const query = c.req.query();
    const bounds: BoundingBox = {
      north: Number(query.north),
      south: Number(query.south),
      east: Number(query.east),
      west: Number(query.west),
    };
    const markers = await MarkerService.getMarkersByBounds(bounds);
    return successResponse(
      c,
      {
        markers: markers, 
        count: markers.length,
      },
      200,
      'Markers retrieved by bounds successfully.'
    );
};
