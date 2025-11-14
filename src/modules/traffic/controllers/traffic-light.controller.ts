// source/controllers/traffic-light.controller.ts
import type { Context } from 'hono';
import { TrafficLightService } from '../services';
import { successResponse } from '@/utils/response';

/**
 * Get traffic light status by ID
 * GET /traffic-lights/:id
 */
export const getTrafficLight = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const result = await TrafficLightService.getTrafficLightById(id);
  return successResponse(c, result);
};

/**
 * Create new traffic light
 * POST /traffic-lights
 */
export const createTrafficLight = async (c: Context) => {
  const body = await c.req.json();
  const trafficLight = await TrafficLightService.createTrafficLight(body);
  return successResponse(
    c,
    { trafficLight },
    201,
    'Traffic light created successfully'
  );
};

/**
 * Update traffic light configuration
 * PUT /traffic-lights/:id
 */
export const updateTrafficLight = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const trafficLight = await TrafficLightService.updateTrafficLight(id, body);
  return successResponse(
    c,
    { trafficLight },
    200,
    'Traffic light updated successfully'
  );
};

/**
 * Delete traffic light
 * DELETE /traffic-lights/:id
 */
export const deleteTrafficLight = async (c: Context) => {
  const id = Number(c.req.param('id'));
  await TrafficLightService.deleteTrafficLight(id);
  return successResponse(c, null, 200, 'Traffic light deleted successfully');
};

/**
 * List all traffic lights with filters
 * GET /traffic-lights
 */
export const listTrafficLights = async (c: Context) => {
  const query = c.req.query();

  const filters = {
    intersection_id: query.intersection_id
      ? Number(query.intersection_id)
      : undefined,
    road_id: query.road_id ? Number(query.road_id) : undefined,
    status: query.status ? Number(query.status) : undefined,
    auto_mode: query.auto_mode ? query.auto_mode === 'true' : undefined,
    min_density: query.min_density ? Number(query.min_density) : undefined,
    max_density: query.max_density ? Number(query.max_density) : undefined,
  };

  const result = await TrafficLightService.listTrafficLights(filters);
  return successResponse(c, result);
};

/**
 * Get traffic lights by intersection
 * GET /traffic-lights/intersection/:intersection_id
 */
export const getTrafficLightsByIntersection = async (c: Context) => {
  const intersection_id = Number(c.req.param('intersection_id'));
  const result =
    await TrafficLightService.getTrafficLightsByIntersection(intersection_id);
  return successResponse(c, result);
};

/**
 * Get traffic lights by road
 * GET /traffic-lights/road/:road_id
 */
export const getTrafficLightsByRoad = async (c: Context) => {
  const road_id = Number(c.req.param('road_id'));
  const result = await TrafficLightService.getTrafficLightsByRoad(road_id);
  return successResponse(c, result);
};

/**
 * Calculate traffic density and get recommended timing
 * GET /traffic-lights/:id/density
 */
export const calculateDensity = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const result = await TrafficLightService.calculateAndUpdateDensity(id);
  return successResponse(
    c,
    result,
    200,
    'Traffic density calculated successfully'
  );
};

/**
 * Update traffic light timing manually
 * POST /traffic-lights/:id/timing
 */
export const updateTiming = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const trafficLight = await TrafficLightService.updateTrafficLightTiming(
    id,
    body
  );
  return successResponse(
    c,
    { trafficLight },
    200,
    'Traffic light timing updated successfully'
  );
};

/**
 * Update traffic light color manually
 * POST /traffic-lights/:id/color
 */
export const updateColor = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const { color } = await c.req.json();
  const trafficLight = await TrafficLightService.updateTrafficLightColor(
    id,
    color
  );
  return successResponse(
    c,
    { trafficLight },
    200,
    'Traffic light color updated successfully'
  );
};

/**
 * Get coordinated timing for intersection
 * GET /traffic-lights/intersection/:intersection_id/timing
 */
export const getIntersectionTiming = async (c: Context) => {
  const intersection_id = Number(c.req.param('intersection_id'));
  const timingMap =
    await TrafficLightService.getIntersectionCoordinatedTiming(intersection_id);

  // Convert Map to object for JSON serialization
  const timing = Object.fromEntries(timingMap);

  return successResponse(
    c,
    { timing },
    200,
    'Coordinated timing calculated successfully'
  );
};
