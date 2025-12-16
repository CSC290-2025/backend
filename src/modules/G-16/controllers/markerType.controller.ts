import * as markerTypeService from '@/modules/G-16/services/markerType.service'
import type {
    CreateMarkerTypeInput,
    UpdateMarkerTypeInput,
    MarkerTypeResponse,
  } from '../types/markerType.types';
import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { ValidationError, handlePrismaError } from '@/errors';
import { MarkerTypeQuerySchema } from '../schema/markerType.schema';

export const createMarkerType =async (c: Context) => {
    const validatedData = await c.req.json();
    const marker = await markerTypeService.createMarkerType(validatedData);
    return successResponse(c, {marker}, 201, 'Create marker successfully')
}

export const getMarkerTypeById =async (c: Context) => {
    // console.log('')
    const id = c.req.param('id');
    const markerIdNumber = Number(id);
    const marker = await markerTypeService.getMarkerTypeById(markerIdNumber);

    return successResponse(c, {marker}, 201, 'Marker Id successfully')
}


export const getAllMarkerTypes =async (c: Context) => {
    const query = c.req.query();
    const validatedQuery = MarkerTypeQuerySchema.parse(query);
    const marker = await markerTypeService.getAllMarkerTypes(validatedQuery);

    return successResponse(c, {
        marker: marker, 
        count: marker.length 
    }, 200, 'Marker types retrieved successfully'); 
}


export const getMarkerTypesByType =async (c :Context) => {
    const {markerType_id} = c.req.param();
    const markerTypeIdNumber = Number(markerType_id);
    if (isNaN(markerTypeIdNumber)) {
        throw new ValidationError('markerType_id must be a number.');
    }
    
    if (markerTypeIdNumber < 1 || markerTypeIdNumber > 8 || !Number.isInteger(markerTypeIdNumber)) {
        throw new ValidationError('markerType_id must be an integer between 1 and 8.');
    }

    const marker = await markerTypeService.getMarkerTypesByTypeService([markerTypeIdNumber]);
    return successResponse(c, {
        marker: marker, 
        count: marker.length 
    }, 200, 'Marker types retrieved successfully'); 
}

export const getMarkerTypeByTypes =async (c: Context) => {
    const body = await c.req.json();
    const { marker_type_ids } = body;

    if (!Array.isArray(marker_type_ids) || marker_type_ids.length === 0) {
        throw new ValidationError('marker_type_ids must be an array and contain at least one item.');
    }

    for (const id of marker_type_ids) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id < 1 || id > 8) {
          throw new ValidationError('All marker_type_ids must be integers between 1 and 8.');
        }
    }
      const marker = await markerTypeService.getMarkerTypesByTypeService(marker_type_ids);
      return successResponse(c, {marker: marker, 
        count: marker.length }, 200,'Marker types retrieved successfully' )
}

export const getMarkerTypesInBounds =async (c : Context) => {
    const { minLat, maxLat, minLng, maxLng, markerTypeIds } = await c.req.json();

    // Validate bounds
    if (
      typeof minLat !== 'number' ||
      typeof maxLat !== 'number' ||
      typeof minLng !== 'number' ||
      typeof maxLng !== 'number'
    ) {
      throw new ValidationError('All bounds parameters must be numbers.');
    }

    if (minLat < -90 || maxLat > 90 || minLng < -180 || maxLng > 180) {
      throw new ValidationError('Bounds are outside the valid range: Latitude (-90 to 90), Longitude (-180 to 180).');
    }

    if (minLat >= maxLat || minLng >= maxLng) {
      throw new ValidationError('The min value must be less than the max value for both latitude and longitude.');
    }

    // Validate markerTypeIds (ถ้ามี)
    if (markerTypeIds !== undefined) {
      if (!Array.isArray(markerTypeIds)) {
        throw new ValidationError('markerTypeIds must be an array.');
      }

      for (const id of markerTypeIds) {
        if (!Number.isInteger(id) || id < 1 || id > 8) {
          throw new ValidationError('All marker_type_ids must be integers between 1 and 8.');
        }
      }
    }

    const marker = await markerTypeService.getMarkerTypesInBounds({
      minLat,
      maxLat,
      minLng,
      maxLng,
      markerTypeIds,
    });

    return successResponse(c, {marker: marker, 
        count: marker.length }, 200,'Markers within bounds retrieved successfully' );
};

export const updateMarkerType = async (c: Context) => {

    const { id } = c.req.param(); 
    const markerIdNumber = Number(id);

    if (isNaN(markerIdNumber) || markerIdNumber < 1 || !Number.isInteger(markerIdNumber)) {
        throw new ValidationError('Invalid Marker ID (must be a positive integer).');
    }

    const validatedData = await c.req.json();
    const marker = await markerTypeService.updateMarkerTypeService(markerIdNumber, validatedData);

    if (!marker) {
        return successResponse(c, null, 404, `Marker with ID ${markerIdNumber} not found.`);
    }

    return successResponse(c, { marker }, 200, 'Marker Type updated successfully.');
}

export const deleteMarkerType =async (c :Context) => {
    const { id } = c.req.param();
    const markerIdNumber = Number(id);
    const deletionResult = await markerTypeService.deleteMarkerType(markerIdNumber);

    return successResponse(c, {deletionResult}, 200, 'Marker Deleted Succesfully')
}