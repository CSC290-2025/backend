import type { Context } from 'hono';
import prisma from '@/config/client';
import { successResponse, errorResponse } from '@/utils/response';

export const getActiveEmergencies = async (c: Context) => {
  try {
    const reports = await prisma.emergency_reports.findMany({
      where: {
        status: {
          in: ['pending', 'verified'],
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 50, // Limit to recent 50 for now
    });

    return successResponse(
      c,
      reports,
      200,
      'Active emergencies fetched successfully'
    );
  } catch (error: any) {
    console.error('Error fetching emergencies:', error);
    return errorResponse(c, 'Failed to fetch emergencies', 500);
  }
};
