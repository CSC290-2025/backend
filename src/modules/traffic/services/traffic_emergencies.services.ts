import { TrafficEmergencyModel } from '../models';
import type {
  TrafficEmergency,
  CreateTrafficEmergencyData,
  UpdateTrafficEmergencyData,
  TrafficEmergencyFilterOptions,
  PaginationOptions,
  PaginatedTrafficEmergencies,
} from '../types';
import { NotFoundError, ValidationError } from '@/errors';

const getTrafficEmergencyById = async (
  id: number
): Promise<TrafficEmergency> => {
  const emergency = await TrafficEmergencyModel.findById(id);
  if (!emergency) throw new NotFoundError('Traffic emergency not found');
  return emergency;
};

const createTrafficEmergency = async (
  data: CreateTrafficEmergencyData
): Promise<TrafficEmergency> => {
  if (!data.user_id) {
    throw new ValidationError('User ID is required');
  }

  if (!data.accident_location) {
    throw new ValidationError('Accident location is required');
  }

  if (!data.destination_hospital) {
    throw new ValidationError('Destination hospital is required');
  }

  const { latitude, longitude } = data.accident_location;
  if (latitude < -90 || latitude > 90) {
    throw new ValidationError('Invalid latitude');
  }
  if (longitude < -180 || longitude > 180) {
    throw new ValidationError('Invalid longitude');
  }

  return await TrafficEmergencyModel.create(data);
};

const updateTrafficEmergency = async (
  id: number,
  data: UpdateTrafficEmergencyData
): Promise<TrafficEmergency> => {
  const existingEmergency = await TrafficEmergencyModel.findById(id);
  if (!existingEmergency)
    throw new NotFoundError('Traffic emergency not found');

  if (data.accident_location) {
    const { latitude, longitude } = data.accident_location;
    if (latitude < -90 || latitude > 90) {
      throw new ValidationError('Invalid latitude');
    }
    if (longitude < -180 || longitude > 180) {
      throw new ValidationError('Invalid longitude');
    }
  }

  return await TrafficEmergencyModel.update(id, data);
};

const deleteTrafficEmergency = async (id: number): Promise<void> => {
  const emergency = await TrafficEmergencyModel.findById(id);
  if (!emergency) throw new NotFoundError('Traffic emergency not found');

  await TrafficEmergencyModel.deleteById(id);
};

const listTrafficEmergencies = async (
  filters: TrafficEmergencyFilterOptions,
  pagination: PaginationOptions
): Promise<PaginatedTrafficEmergencies> => {
  return await TrafficEmergencyModel.findWithPagination(filters, pagination);
};

const getTrafficEmergenciesByUser = async (
  userId: number
): Promise<TrafficEmergency[]> => {
  return await TrafficEmergencyModel.findByUser(userId);
};

const getTrafficEmergenciesByStatus = async (
  status: string
): Promise<TrafficEmergency[]> => {
  return await TrafficEmergencyModel.findByStatus(status);
};

const getTrafficEmergencyStats = async (): Promise<{
  total_emergencies: number;
  pending: number;
  dispatched: number;
  in_transit: number;
  arrived: number;
  completed: number;
  cancelled: number;
}> => {
  return await TrafficEmergencyModel.getStats();
};

export {
  getTrafficEmergencyById,
  createTrafficEmergency,
  updateTrafficEmergency,
  deleteTrafficEmergency,
  listTrafficEmergencies,
  getTrafficEmergenciesByUser,
  getTrafficEmergenciesByStatus,
  getTrafficEmergencyStats,
};
