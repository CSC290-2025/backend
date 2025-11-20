import type { Context } from 'hono';
import { TrafficEmergencyService } from '../services';
import { successResponse } from '@/utils/response';

const getTrafficEmergency = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const emergency = await TrafficEmergencyService.getTrafficEmergencyById(id);
  return successResponse(c, emergency);
};

const createTrafficEmergency = async (c: Context) => {
  const body = await c.req.json();
  const emergency = await TrafficEmergencyService.createTrafficEmergency(body);
  return successResponse(
    c,
    emergency,
    201,
    'Traffic emergency created successfully'
  );
};

const updateTrafficEmergency = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const emergency = await TrafficEmergencyService.updateTrafficEmergency(
    id,
    body
  );
  return successResponse(
    c,
    emergency,
    200,
    'Traffic emergency updated successfully'
  );
};

const deleteTrafficEmergency = async (c: Context) => {
  const id = Number(c.req.param('id'));
  await TrafficEmergencyService.deleteTrafficEmergency(id);
  return successResponse(
    c,
    null,
    200,
    'Traffic emergency deleted successfully'
  );
};

const listTrafficEmergencies = async (c: Context) => {
  const query = c.req.query();

  const filters = {
    user_id: query.user_id ? Number(query.user_id) : undefined,
    status: query.status as
      | 'pending'
      | 'dispatched'
      | 'in_transit'
      | 'arrived'
      | 'completed'
      | 'cancelled'
      | undefined,
    ambulance_vehicle_id: query.ambulance_vehicle_id
      ? Number(query.ambulance_vehicle_id)
      : undefined,
    start_date: query.start_date ? new Date(query.start_date) : undefined,
    end_date: query.end_date ? new Date(query.end_date) : undefined,
  };

  const pagination = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: (query.sortBy as 'created_at' | 'status' | 'id') || 'created_at',
    sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
  };

  const result = await TrafficEmergencyService.listTrafficEmergencies(
    filters,
    pagination
  );
  return successResponse(c, result);
};

const getTrafficEmergenciesByUser = async (c: Context) => {
  const userId = Number(c.req.param('userId'));
  const emergencies =
    await TrafficEmergencyService.getTrafficEmergenciesByUser(userId);
  return successResponse(c, { emergencies });
};

const getTrafficEmergenciesByStatus = async (c: Context) => {
  const status = c.req.param('status');
  const emergencies =
    await TrafficEmergencyService.getTrafficEmergenciesByStatus(status);
  return successResponse(c, { emergencies });
};

const getTrafficEmergencyStats = async (c: Context) => {
  const stats = await TrafficEmergencyService.getTrafficEmergencyStats();
  return successResponse(c, { stats });
};

export {
  getTrafficEmergency,
  createTrafficEmergency,
  updateTrafficEmergency,
  deleteTrafficEmergency,
  listTrafficEmergencies,
  getTrafficEmergenciesByUser,
  getTrafficEmergenciesByStatus,
  getTrafficEmergencyStats,
};
