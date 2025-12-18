import type { Context } from 'hono';
import { RoadService } from '../services';
import { successResponse } from '@/utils/response';

const getRoad = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const road = await RoadService.getRoadById(id);
  return successResponse(c, road);
};

const createRoad = async (c: Context) => {
  const body = await c.req.json();
  const road = await RoadService.createRoad(body);
  return successResponse(c, road, 201, 'Road created successfully');
};

const updateRoad = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const road = await RoadService.updateRoad(id, body);
  return successResponse(c, road, 200, 'Road updated successfully');
};

const deleteRoad = async (c: Context) => {
  const id = Number(c.req.param('id'));
  await RoadService.deleteRoad(id);
  return successResponse(c, null, 200, 'Road deleted successfully');
};

const listRoads = async (c: Context) => {
  const query = c.req.query();

  const filters = {
    name: query.name,
    start_intersection_id: query.start_intersection_id
      ? Number(query.start_intersection_id)
      : undefined,
    end_intersection_id: query.end_intersection_id
      ? Number(query.end_intersection_id)
      : undefined,
    min_length: query.min_length ? Number(query.min_length) : undefined,
    max_length: query.max_length ? Number(query.max_length) : undefined,
  };

  const pagination = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: (query.sortBy as 'name' | 'length_meters' | 'id') || 'id',
    sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
  };

  const result = await RoadService.listRoads(filters, pagination);
  return successResponse(c, result);
};

const getRoadsByIntersection = async (c: Context) => {
  const intersectionId = Number(c.req.param('intersectionId'));
  const roads = await RoadService.getRoadsByIntersection(intersectionId);
  return successResponse(c, { roads });
};

const getRoadStats = async (c: Context) => {
  const stats = await RoadService.getRoadStats();
  return successResponse(c, { stats });
};

const getRoadDetails = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const details = await RoadService.getRoadDetails(id);
  return successResponse(c, details);
};

export {
  getRoad,
  createRoad,
  updateRoad,
  deleteRoad,
  listRoads,
  getRoadsByIntersection,
  getRoadStats,
  getRoadDetails,
};
