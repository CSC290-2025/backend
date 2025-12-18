import { successResponse } from '@/utils/response';
import { TransactionService } from '../services';
import type { Context } from 'hono';

const getWalletTransaction = async (c: Context) => {
  const id = Number(c.req.param('transactionId'));
  const transaction = await TransactionService.getWalletTransaction(id);
  return successResponse(c, { transaction });
};

const getCardTransaction = async (c: Context) => {
  const id = Number(c.req.param('cardTransactionId'));
  const transaction = await TransactionService.getCardTransaction(id);
  return successResponse(c, { transaction });
};

const getAllWalletTransactions = async (c: Context) => {
  const transactions = await TransactionService.getAllWalletTransactions();
  return successResponse(c, transactions);
};

const getAllCardTransactions = async (c: Context) => {
  const transactions = await TransactionService.getAllCardTransactions();
  return successResponse(c, transactions);
};

const getAllTransactions = async (c: Context) => {
  const transactions = await TransactionService.getAllTransactions();
  return successResponse(c, transactions);
};

export {
  getWalletTransaction,
  getCardTransaction,
  getAllWalletTransactions,
  getAllCardTransactions,
  getAllTransactions,
};
