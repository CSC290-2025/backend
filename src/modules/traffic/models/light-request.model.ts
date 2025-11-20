import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { CreateLightRequestDTO, LightRequestFilters } from '../types';

export const createLightRequest = async (data: CreateLightRequestDTO) => {
  try {
    return await prisma.light_requests.create({
      data: {
        traffic_light_id: data.traffic_light_id,
        requested_at: new Date(),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export const findLightRequests = async (
  filters: LightRequestFilters,
  pagination: { page: number; per_page: number }
) => {
  try {
    const where: any = {};

    if (filters.traffic_light_id) {
      where.traffic_light_id = filters.traffic_light_id;
    }

    if (filters.start_date || filters.end_date) {
      where.requested_at = {};
      if (filters.start_date) {
        where.requested_at.gte = new Date(filters.start_date);
      }
      if (filters.end_date) {
        where.requested_at.lte = new Date(filters.end_date);
      }
    }

    const [data, total] = await Promise.all([
      prisma.light_requests.findMany({
        where,
        include: {
          traffic_lights: true,
        },
        skip: (pagination.page - 1) * pagination.per_page,
        take: pagination.per_page,
        orderBy: { requested_at: 'desc' },
      }),
      prisma.light_requests.count({ where }),
    ]);

    return { data, total };
  } catch (error) {
    handlePrismaError(error);
  }
};
