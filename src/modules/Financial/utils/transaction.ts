import prisma from '@/config/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { transaction_type } from '@/generated/prisma';

interface CreateWalletTransactionData {
  wallet_id: number;
  transaction_type: transaction_type;
  amount: number;
  target_wallet_id?: number;
  target_service?: string;
  description?: string;
}

const createWalletTransaction = async (data: CreateWalletTransactionData) => {
  return await prisma.wallet_transactions.create({
    data: {
      wallet_id: data.wallet_id,
      transaction_type: data.transaction_type,
      amount: new Decimal(data.amount),
      target_wallet_id: data.target_wallet_id,
      target_service: data.target_service,
      description: data.description,
    },
  });
};

export { createWalletTransaction };
