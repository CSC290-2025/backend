import { successResponse } from '@/utils/response';
import { InsuranceCardService } from '../services';
import type { Context } from 'hono';

const getCard = async (c: Context) => {
  const cardId = Number(c.req.param('cardId'));
  const card = await InsuranceCardService.getCardById(cardId);
  return successResponse(c, { card });
};

const getUserCard = async (c: Context) => {
  const userId = Number(c.req.param('userId'));
  const cards = await InsuranceCardService.getCardsByUserId(userId);
  return successResponse(c, { cards });
};

const createCard = async (c: Context) => {
  const body = await c.req.json();
  const card = await InsuranceCardService.createCard(body);
  return successResponse(
    c,
    { card },
    201,
    'Insurance card created successfully'
  );
};

const topUpCard = async (c: Context) => {
  const cardId = Number(c.req.param('cardId'));
  const body = await c.req.json();
  const result = await InsuranceCardService.topUpFromWallet(cardId, body);
  return successResponse(
    c,
    result,
    200,
    'Insurance card topped up successfully'
  );
};

export { getCard, getUserCard, createCard, topUpCard };
