import { LightRequestModel } from '../models';
import type {
  CreateLightRequestDTO,
  LightRequestFilters,
  LightRequestResponse,
} from '../types';

export const createLightRequest = async (
  data: CreateLightRequestDTO
): Promise<LightRequestResponse> => {
  const request = await LightRequestModel.createLightRequest(data);

  return {
    request_id: request.id,
    traffic_light_id: request.traffic_light_id ?? 0,
    requested_by: data.requested_by,
    priority: data.priority,
    reason: data.reason,
    status: 'completed',
    requested_at: request.requested_at.toISOString(),
  };
};

export const getLightRequests = async (
  filters: LightRequestFilters,
  pagination: { page: number; per_page: number }
) => {
  const { data, total } = await LightRequestModel.findLightRequests(
    filters,
    pagination
  );

  const formattedData: LightRequestResponse[] = data.map((req: any) => ({
    request_id: req.id,
    traffic_light_id: req.traffic_light_id ?? 0,
    requested_by: 'system',
    priority: 'medium' as const,
    reason: 'automatic',
    status: 'completed',
    requested_at: req.requested_at.toISOString(),
  }));

  return {
    data: formattedData,
    meta: {
      total,
      page: pagination.page,
      per_page: pagination.per_page,
      filters_applied: filters,
    },
  };
};
