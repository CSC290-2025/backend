import { RoadModel } from '../models';
import type {
  Road,
  CreateRoadData,
  UpdateRoadData,
  RoadFilterOptions,
  PaginationOptions,
  PaginatedRoads,
} from '../types';
import { NotFoundError, ValidationError } from '@/errors';

const getRoadById = async (id: number): Promise<Road> => {
  const road = await RoadModel.findById(id);
  if (!road) throw new NotFoundError('Road not found');
  return road;
};

const createRoad = async (data: CreateRoadData): Promise<Road> => {
  if (!data.name) {
    throw new ValidationError('Road name is required');
  }

  if (data.start_intersection_id === data.end_intersection_id) {
    throw new ValidationError('Start and end intersections must be different');
  }

  if (data.length_meters && data.length_meters <= 0) {
    throw new ValidationError('Length must be greater than 0');
  }

  return await RoadModel.create(data);
};

const updateRoad = async (id: number, data: UpdateRoadData): Promise<Road> => {
  const existingRoad = await RoadModel.findById(id);
  if (!existingRoad) throw new NotFoundError('Road not found');

  if (data.start_intersection_id && data.end_intersection_id) {
    if (data.start_intersection_id === data.end_intersection_id) {
      throw new ValidationError(
        'Start and end intersections must be different'
      );
    }
  }

  if (data.length_meters && data.length_meters <= 0) {
    throw new ValidationError('Length must be greater than 0');
  }

  return await RoadModel.update(id, data);
};

const deleteRoad = async (id: number): Promise<void> => {
  const road = await RoadModel.findById(id);
  if (!road) throw new NotFoundError('Road not found');

  await RoadModel.deleteById(id);
};

const listRoads = async (
  filters: RoadFilterOptions,
  pagination: PaginationOptions
): Promise<PaginatedRoads> => {
  return await RoadModel.findWithPagination(filters, pagination);
};

const getRoadsByIntersection = async (
  intersectionId: number
): Promise<Road[]> => {
  return await RoadModel.findByIntersection(intersectionId);
};

const getRoadStats = async (): Promise<{
  total_roads: number;
  total_length: number;
  avg_length: number;
  min_length: number;
  max_length: number;
}> => {
  return await RoadModel.getStats();
};

export {
  getRoadById,
  createRoad,
  updateRoad,
  deleteRoad,
  listRoads,
  getRoadsByIntersection,
  getRoadStats,
};
