import type {
  CreateMarkerTypeInput,
  UpdateMarkerInput,
  MarkerTypeResponse,
  MarkerRow,
  MarkerQuery,
  UpdateMarkerTypeInput,
} from '../types';
import prisma from '@/config/client.ts';
import {
  createMarkerType as createMarkerTypeModel,
  getMarkerTypeById as getMarkerTypeByIdModel,
  getAllMarkerTypes as getAllMarkerTypesModel,
  getMarkerTypesByType as getMarkersByTypesModel,
  deleteMarkerType as deleteMarkerTypeModel,
  updateMarkerType as updateMarkerTypeModel,
  getMarkerTypesInBounds as getMarkerTypesInBoundsModel,
} from '../models/markerType.model';
import { handlePrismaError, ValidationError } from '@/errors';

export const createMarkerType = async (
  data: CreateMarkerTypeInput
): Promise<MarkerTypeResponse> => {
  const markerType = await prisma.marker_type.findUnique({
    where: { id: data.marker_type_id }, // ตรวจสอบ ID 9
  });
  if (!markerType) {
    throw new ValidationError(`Marker type ${data.marker_type_id} not found`);
  }
  return await createMarkerTypeModel(data);
};

export const getMarkerTypeById = async (
  id: number
): Promise<MarkerTypeResponse | null> => {
  return await getMarkerTypeByIdModel(id);
};

export const getAllMarkerTypes = async (
  query?: MarkerQuery
): Promise<MarkerTypeResponse[]> => {
  if (!query) {
    return await getAllMarkerTypes();
  }

  if (query.marker_type_ids && query.marker_type_ids.length > 0) {
    return await getMarkersByTypesModel(query.marker_type_ids);
  }

  if (query.marker_type_id) {
    return await getMarkersByTypesModel([query.marker_type_id]);
  }

  return await getAllMarkerTypesModel(query);
};

export const getMarkerTypesByTypeService = async (
  markerTypeId: number[]
): Promise<MarkerTypeResponse[]> => {
  return await getMarkersByTypesModel(markerTypeId);
};

export const updateMarkerTypeService = async (
  id: number,
  data: UpdateMarkerTypeInput
): Promise<MarkerTypeResponse> => {
  return await updateMarkerTypeModel(id, data);
};

export const deleteMarkerType = async (id: number): Promise<void> => {
  return await deleteMarkerTypeModel(id);
};

export const getMarkerTypesInBounds = async (bounds: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  markerTypeIds?: number[];
}): Promise<MarkerTypeResponse[]> => {
  // Validate bounds
  if (
    bounds.minLat < -90 ||
    bounds.maxLat > 90 ||
    bounds.minLng < -180 ||
    bounds.maxLng > 180
  ) {
    throw new ValidationError('Invalid bounds coordinates');
  }

  if (bounds.minLat >= bounds.maxLat || bounds.minLng >= bounds.maxLng) {
    throw new ValidationError(
      'Min coordinates must be less than max coordinates'
    );
  }

  if (bounds.markerTypeIds && bounds.markerTypeIds.length > 0) {
    for (const id of bounds.markerTypeIds) {
      if (!Number.isInteger(id) || id < 1 || id > 8) {
        throw new ValidationError('marker_type_id must be between 1 and 8');
      }
    }
  }

  return await getMarkerTypesInBoundsModel(bounds);
};
