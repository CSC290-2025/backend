import type { Context } from 'hono';
import { distanceMatrix } from '../services/distanceG1.service';

export const calculateDistance = async (c: Context) => {
  try {
    const { origin, destination } = await c.req.json();
    const result = await distanceMatrix(origin, destination);
    return c.json(result);
  } catch (error: any) {
    return c.json(
      {
        error: 'Failed to calculate distance',
        message: error.message,
      },
      400
    );
  }
};