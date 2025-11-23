import { NotFoundError, UnauthorizedError } from '@/errors';
import { successResponse } from '@/utils/response';
import { MetroCardService } from '../services';
import type { Context } from 'hono';

const getMetroCard = async (c: Context) => {
  const user = c.get('user');
  const metroCardId = Number(c.req.param('metroCardId'));
  const card = await MetroCardService.getMetroCardById(metroCardId);
  if (card === null) {
    throw new NotFoundError('Metro Card not found');
  }
  if (card.user_id !== user.userId) {
    throw new UnauthorizedError('You do not own this metro card');
  }
  const metroCards = await MetroCardService.getMetroCardById(metroCardId);
  return successResponse(c, metroCards);
};

const createMyMetroCard = async (c: Context) => {
  const user = c.get('user');
  const metroCard = await MetroCardService.createMetroCard(user.userId);
  return successResponse(
    c,
    { metroCard },
    201,
    'Metro card created successfully'
  );
};

const getUserMetroCards = async (c: Context) => {
  const userId = Number(c.req.param('userId'));
  const metroCards = await MetroCardService.getUserMetroCards(userId);
  return successResponse(c, { metroCards });
};

const updateMetroCard = async (c: Context) => {
  const metroCardId = Number(c.req.param('metroCardId'));
  const body = await c.req.json();
  const metroCard = await MetroCardService.updateMetroCard(metroCardId, body);
  return successResponse(
    c,
    { metroCard },
    200,
    'Metro card updated successfully'
  );
};

const topUpBalance = async (c: Context) => {
  const body = await c.req.json();
  const result = await MetroCardService.topUpBalance(
    body.cardNumber,
    body.walletId,
    body.amount
  );
  return successResponse(c, result, 200, 'Balance topped up successfully');
};

const deleteMyMetroCard = async (c: Context) => {
  const user = c.get('user');
  const metroCardId = Number(c.req.param('metroCardId'));
  const card = await MetroCardService.getMetroCardById(metroCardId);
  if (card.user_id !== user.userId) {
    throw new UnauthorizedError('You do not own this metro card');
  }
  await MetroCardService.deleteMetroCardById(metroCardId);
  return successResponse(c, null, 200, 'Metro card deleted successfully');
};

const transferToTransportation = async (c: Context) => {
  const body = await c.req.json();
  const result = await MetroCardService.transferToTransportation(
    body.cardNumber,
    body.amount
  );
  return successResponse(
    c,
    result,
    200,
    'Balance transferred to transportation wallet successfully'
  );
};

const getMyMetroCards = async (c: Context) => {
  const user = c.get('user');
  console.log(user);
  const metroCards = await MetroCardService.getUserMetroCards(user.userId);
  return successResponse(c, { metroCards });
};

export {
  getMetroCard,
  createMyMetroCard,
  getUserMetroCards,
  updateMetroCard,
  topUpBalance,
  deleteMyMetroCard,
  transferToTransportation,
  getMyMetroCards,
};
