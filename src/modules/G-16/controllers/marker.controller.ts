import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import * as MarkerService  from '@/modules/G-16/services/marker.service';

import type {
  CreateMarkerInput,
  UpdateMarkerInput,
  MarkerQuery,
  BoundingBox,
} from '@/modules/G-16/types';


// GET /api/markers
export const getAllMarkers = async (c: Context) => {
  try {
    const query = c.req.query();
    const filters: Partial<MarkerQuery> = {
      marker_type_id: query.marker_type_id ? Number(query.marker_type_id) : undefined,
      marker_type_ids: query.marker_type_ids 
        ? query.marker_type_ids.split(',').map(Number) 
        : undefined,
      limit: query.limit ? Number(query.limit) : 100,
      offset: query.offset ? Number(query.offset) : 0,
      sortBy: query.sortBy as any,
      sortOrder: query.sortOrder as any,
    };

    const markers = await MarkerService.getAllMarkers(filters as MarkerQuery);

    return c.json({
      success: true,
      data: markers,
      count: markers.length,
      filters: filters,
    });
  } catch (error) {
    console.error('Error fetching markers:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch markers',
      },
      500
    );
  }
};

export const getMarkerById = async (c: Context) => {
  try {
    const id = c.req.param('id');

    const marker = await MarkerService.getMarker(id);

    if (!marker) {
      return c.json(
        {
          success: false,
          error: 'Marker not found',
        },
        404
      );
    }
    return c.json({
      success: true,
      data: marker,
    });
  } catch (error) {
    console.error('Error fetching marker:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch marker',
      },
      500
    );
  }
};

export const createMarker = async (c: Context) => {
  try {
    const markerData = await c.req.json<CreateMarkerInput>();

    const newMarker = await MarkerService.addtheMarker(markerData);

    return c.json(
      {
        success: true,
        data: newMarker,
        message: 'Marker created successfully',
      },
      201
    );
  } catch (error) {
    console.error('Error creating marker:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to create marker',
      },
      500
    );
  }
};

// PUT /api/markers/:id

export const updateMarker = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const markerData = await c.req.json<UpdateMarkerInput>();
    
    // console.log('Updating marker:', id, markerData);

    const updatedMarker = await MarkerService.updateMarker(id, markerData);

    return c.json({
      success: true,
      data: updatedMarker,
      message: 'Marker updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating marker:', error);
    
    if (error.message && error.message.includes('not found')) {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }
    
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to update marker',
      },
      500
    );
  }
};

//Delete Marker
export const deleteMarker = async (c: Context) => {
  try {
    const id = c.req.param('id');
    
    // console.log('Deleting marker:', id);

    await MarkerService.deleteMarker(id);

    return c.json({
      success: true,
      message: 'Marker deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting marker:', error);
    
    if (error.message && error.message.includes('not found')) {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }
    
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to delete marker',
      },
      500
    );
  }
};

// GET /api/markers/bounds
export const getMarkersByBounds = async (c: Context) => {
  try {
    const query = c.req.query();
    const bounds: BoundingBox = {
      north: Number(query.north),
      south: Number(query.south),
      east: Number(query.east),
      west: Number(query.west),
    };

    const markers = await MarkerService.getMarkersByBounds(bounds);

    return c.json({
      success: true,
      data: markers,
      count: markers.length,
    });
  } catch (error) {
    console.error('Error fetching markers by bounds:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch markers by bounds',
      },
      500
    );
  }
};
