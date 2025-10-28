import { successResponse } from '@/utils/response';
import { MetroCardService } from '../services';
import type { Context } from 'hono';

const getMetroCard = async (c: Context) => {
  const metroCardId = Number(c.req.param('metroCardId'));
  const metroCards = await MetroCardService.getMetroCardById(metroCardId);
  return successResponse(c, { metroCards });
};

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

const getUserMetroCards = async (c: Context) => {
  const userId = Number(c.req.param('userId'));
  const wallets = await MetroCardService.getUserMetroCards(userId);
  return successResponse(c, { wallets });
};

export { getMetroCard, createMetroCard, getUserMetroCards };
