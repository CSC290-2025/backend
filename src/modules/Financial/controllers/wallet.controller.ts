import { successResponse } from '@/utils/response';
import { WalletService } from '../services';
import type { Context } from 'hono';

const getWallet = async (c: Context) => {
  const walletId = Number(c.req.param('walletId'));
  const wallet = await WalletService.getWalletById(walletId);
  return successResponse(c, { wallet });
};

const createWallet = async (c: Context) => {
  const body = await c.req.json();
  const wallet = await WalletService.createWallet(body);
  return successResponse(c, { wallet }, 201, 'Wallet created successfully');
};

const updateWallet = async (c: Context) => {
  const walletId = Number(c.req.param('walletId'));
  const body = await c.req.json();
  const wallet = await WalletService.updateWallet(walletId, body);
  return successResponse(c, { wallet }, 200, 'Wallet updated successfully');
};

const getUserWallets = async (c: Context) => {
  const userId = Number(c.req.param('userId'));
  const wallet = await WalletService.getUserWallets(userId);
  return successResponse(c, { wallet });
};

const topUpBalance = async (c: Context) => {
  const walletId = Number(c.req.param('walletId'));
  const body = await c.req.json();
  const wallet = await WalletService.topUpBalance(walletId, body.amount);
  return successResponse(c, { wallet }, 200, 'Balance topped up successfully');
};

const transferBetweenUsers = async (c: Context) => {
  const body = await c.req.json();
  const result = await WalletService.transferFunds(
    body.from_user_id,
    body.to_user_id,
    body.amount
  );
  return successResponse(c, result, 200, 'Transfer completed successfully');
};

export {
  getWallet,
  createWallet,
  updateWallet,
  getUserWallets,
  topUpBalance,
  transferBetweenUsers,
};
