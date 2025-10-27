import { successResponse } from '@/utils/response';
import { MetroCardService } from '../services';
import type { Context } from 'hono';

const createMetroCard = async (c: Context) => {
  const body = await c.req.json();
  const metroCard = await MetroCardService.createMetroCard(body.user_id);
  return successResponse(
    c,
    { metroCard },
    201,
    'Metro card created successfully'
  );
};

export { createMetroCard };
