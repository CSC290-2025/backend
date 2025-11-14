// source/controllers/intersection.controller.ts
import type { Context } from 'hono';
import { IntersectionService } from '../services';
import { successResponse } from '@/utils/response';

/**
 * Get intersection by ID with traffic lights and roads
 * GET /intersections/:id
 */
export const getIntersection = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const intersection = await IntersectionService.getIntersectionById(id);
  return successResponse(c, { intersection });
};

/**
 * Create new intersection
 * POST /intersections
 */
export const createIntersection = async (c: Context) => {
  const body = await c.req.json();
  const intersection = await IntersectionService.createIntersection(body);
  return successResponse(
    c,
    { intersection },
    201,
    'Intersection created successfully'
  );
};

/**
 * Update intersection location
 * PUT /intersections/:id
 */
export const updateIntersection = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const intersection = await IntersectionService.updateIntersection(id, body);
  return successResponse(
    c,
    { intersection },
    200,
    'Intersection location updated successfully'
  );
};

/**
 * Delete intersection
 * DELETE /intersections/:id
 */
export const deleteIntersection = async (c: Context) => {
  const id = Number(c.req.param('id'));
  await IntersectionService.deleteIntersection(id);
  return successResponse(c, null, 200, 'Intersection deleted successfully');
};

/**
 * List all intersections
 * GET /intersections
 */
export const listIntersections = async (c: Context) => {
  const query = c.req.query();

  const filters = {
    min_lights: query.min_lights ? Number(query.min_lights) : undefined,
    max_lights: query.max_lights ? Number(query.max_lights) : undefined,
    has_roads: query.has_roads ? query.has_roads === 'true' : undefined,
  };

  const result = await IntersectionService.listIntersections(filters);
  return successResponse(c, result);
};

/**
 * List intersections with traffic lights details
 * GET /intersections/detailed
 */
export const listIntersectionsWithLights = async (c: Context) => {
  const query = c.req.query();

  const filters = {
    min_lights: query.min_lights ? Number(query.min_lights) : undefined,
    max_lights: query.max_lights ? Number(query.max_lights) : undefined,
    has_roads: query.has_roads ? query.has_roads === 'true' : undefined,
  };

  const result = await IntersectionService.listIntersectionsWithLights(filters);
  return successResponse(c, result);
};

/**
 * Find nearby intersections
 * GET /intersections/nearby?lng=100.5&lat=13.7&radius=5000
 */
export const getNearbyIntersections = async (c: Context) => {
  const query = c.req.query();
  const longitude = Number(query.lng);
  const latitude = Number(query.lat);
  const radius = query.radius ? Number(query.radius) : 5000;

  const result = await IntersectionService.findNearbyIntersections(
    longitude,
    latitude,
    radius
  );
  return successResponse(c, result);
};

/**
 * Get intersection statistics
 * GET /intersections/:id/stats
 */
export const getIntersectionStats = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const stats = await IntersectionService.getIntersectionStats(id);
  return successResponse(c, stats);
};
