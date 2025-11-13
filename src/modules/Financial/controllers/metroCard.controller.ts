import { successResponse } from '@/utils/response';
import { MetroCardService } from '../services';
import { WalletModel } from '../models';
import { NotFoundError } from '@/errors';
import type { Context } from 'hono';

const getMetroCard = async (c: Context) => {
  const metroCardId = Number(c.req.param('metroCardId'));
  const metroCards = await MetroCardService.getMetroCardById(metroCardId);
  return successResponse(c, metroCards);
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
  const metroCardId = Number(c.req.param('metroCardId'));

  const body = await c.req.json();

  const existingMetroCard =
    await MetroCardService.getMetroCardById(metroCardId);
  const wallet = await WalletModel.findWalletByUserId(
    existingMetroCard.user_id
  );
  if (!wallet) throw new NotFoundError('Wallet for metro card owner not found');
  const walletId = wallet.id;

  const updatedMetroCard = await MetroCardService.topUpBalance(
    metroCardId,
    walletId,
    body.amount
  );
  return successResponse(
    c,
    { metroCard: updatedMetroCard },
    200,
    'Balance topped up successfully'
  );
};

const deleteMetroCard = async (c: Context) => {
  const metroCardId = Number(c.req.param('metroCardId'));
  await MetroCardService.deleteMetroCardById(metroCardId);
  return successResponse(c, null, 200, 'Metro card deleted successfully');
};

export {
  getMetroCard,
  createMetroCard,
  getUserMetroCards,
  updateMetroCard,
  topUpBalance,
  deleteMetroCard,
};
