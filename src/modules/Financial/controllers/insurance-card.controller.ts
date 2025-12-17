import { NotFoundError, UnauthorizedError } from '@/errors';
import { successResponse } from '@/utils/response';
import { InsuranceCardService } from '../services';
import type { Context } from 'hono';

const getInsuranceCard = async (c: Context) => {
  const user = c.get('user');
  const insuranceCardId = Number(c.req.param('insuranceCardId'));
  const card = await InsuranceCardService.getCardById(insuranceCardId);
  if (card === null) {
    throw new NotFoundError('Insurance Card not found');
  }
  if (card.user_id !== user.userId) {
    throw new UnauthorizedError('You do not own this insurance card');
  }
  return successResponse(c, card);
};

const getMyCards = async (c: Context) => {
  const user = c.get('user');
  const cards = await InsuranceCardService.getCardsByUserId(user.userId);
  return successResponse(c, { insuranceCards: cards });
};

const createCard = async (c: Context) => {
  const user = c.get('user');
  const card = await InsuranceCardService.createCard(user.userId);
  return successResponse(c, card, 201, 'Insurance card created successfully');
};

const topUpCard = async (c: Context) => {
  const body = await c.req.json();
  const result = await InsuranceCardService.topUpFromWallet(
    body.cardNumber,
    body.wallet_id,
    body.amount
  );
  return successResponse(
    c,
    { insuranceCard: result.card, transaction_id: result.transaction_id },
    200,
    'Insurance card topped up successfully'
  );
};

const getUserInsuranceCards = async (c: Context) => {
  const userId = Number(c.req.param('userId'));
  const cards = await InsuranceCardService.getCardsByUserId(userId);
  return successResponse(c, { insuranceCards: cards });
};

const updateInsuranceCard = async (c: Context) => {
  const insuranceCardId = Number(c.req.param('insuranceCardId'));
  const body = await c.req.json();
  const card = await InsuranceCardService.updateInsuranceCard(
    insuranceCardId,
    body
  );
  return successResponse(c, card, 200, 'Insurance card updated successfully');
};

const deleteMyInsuranceCard = async (c: Context) => {
  const user = c.get('user');
  const insuranceCardId = Number(c.req.param('insuranceCardId'));
  const card = await InsuranceCardService.getCardById(insuranceCardId);
  if (card.user_id !== user.userId) {
    throw new UnauthorizedError('You do not own this insurance card');
  }
  await InsuranceCardService.deleteCardById(insuranceCardId);
  return successResponse(c, null, 200, 'Insurance card deleted successfully');
};

const transferToHealthCare = async (c: Context) => {
  const body = await c.req.json();
  const result = await InsuranceCardService.transferToHealthCare(
    body.cardNumber,
    body.amount
  );
  return successResponse(
    c,
    result,
    200,
    'Balance transferred to healthcare wallet successfully'
  );
};

export {
  getInsuranceCard,
  getMyCards,
  createCard,
  topUpCard,
  getUserInsuranceCards,
  updateInsuranceCard,
  deleteMyInsuranceCard,
  transferToHealthCare,
};
