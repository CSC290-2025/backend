import type {
  CreateMarkerInput,
  UpdateMarkerInput,
  MarkerQuery,
  MarkerResponse,
  BoundingBox,
} from '@/modules/G-16/types/marker.types';

import {
  getAllMarkers as getAllMarkersModel,
  getMarkerById,
  createMarker as createMarkerModel,
  updateMarker as updateMarkerModel,
  deleteMarker as deleteMarkerModel,
  getMarkersByTypes,
  getMarkersWithinBounds,
} from '@/modules/G-16/models/marker.model';
import { handlePrismaError } from '@/errors';

export const getAllMarkers = async (
  filters?: MarkerQuery
): Promise<MarkerResponse[]> => {
  try {
    if (filters?.marker_type_ids && filters.marker_type_ids.length > 0) {
      return await getMarkersByTypes(filters.marker_type_ids);
    }

    return await getAllMarkersModel({
      marker_type_id: filters?.marker_type_id,
      skip: filters?.offset || 0,
      take: filters?.limit || 100,
    });
  } catch (error) {
    console.error('Error fetching markers:', error);
    throw new Error('Failed to fetch markers');
  }
};

//GET marker byId
export const getMarker = async (id: string): Promise<MarkerResponse | null> => {
  try {
    return await getMarkerById(id); // model function
  } catch (error) {
    console.error('Error fetching marker:', error);
    throw new Error('Failed to fetch marker');
  }
};

export const addtheMarker = async (
  data: CreateMarkerInput
): Promise<MarkerResponse> => {
  try {
    return await createMarkerModel(data);
  } catch (error) {
    handlePrismaError(error);
  }
};

export const updateMarker = async (
  id: string,
  data: UpdateMarkerInput
): Promise<MarkerResponse> => {
  try {
    return await updateMarkerModel(id, data);
  } catch (error: any) {
    console.error('Error updating marker:', error);

    // if "not found" error then throw
    if (error.message && error.message.includes('not found')) {
      throw error;
    }

    throw new Error('Failed to update marker');
  }
};

export const deleteMarker = async (id: string): Promise<void> => {
  try {
    await deleteMarkerModel(id);
  } catch (error: any) {
    console.error('Error deleting marker:', error);

    // if "not found" error then throw
    if (error.message && error.message.includes('not found')) {
      throw error;
    }

    throw new Error('Failed to delete marker');
  }
};

export const getMarkersByBounds = async (
  bounds: BoundingBox
): Promise<MarkerResponse[]> => {
  try {
    return await getMarkersWithinBounds(bounds);
  } catch (error) {
    handlePrismaError(error);
  }
};

// const markers: markerType[] = [];

// let nextId = 1;
// export function addMarker(
//   m: Omit<markerType, 'id' | 'created_at'>
// ): markerType {
//   const id = String(nextId++); // "1", "2", "3", ...
//   const created_at = new Date().toISOString();
//   const marker: markerType = { id, created_at, ...m };
//   markers.push(marker);
//   return marker;
// }

// // list marker
// export function listMarkers(limit = 100): markerType[] {
//   // reverse new on top
//   return markers.slice(-limit).reverse();
// }

// export function clearMarkers() {
//   markers.length = 0;
// }
// function getMarkersByTypes(marker_type_ids: number[]): { id: number; description: string | null; location: any; marker_type_id: number | null; marker_type: { id: number; marker_type_icon: string | null; marker_type_color: string | null; } | null; created_at: Date; updated_at: Date; }[] | PromiseLike<...> {
//   throw new Error('Function not implemented.');
// }
