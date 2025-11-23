import { WalletModel, MetroCardModel } from '../models';

const transformWalletTransaction = (tx: any) => ({
  ...tx,
  amount: Number(tx.amount),
});

const transformCardTransaction = (tx: any) => ({
  ...tx,
  amount: Number(tx.amount),
});

const getWalletTransaction = async (id: number) => {
  const transaction = await WalletModel.findWalletTransactionById(id);
  return transformWalletTransaction(transaction);
};

const getCardTransaction = async (id: number) => {
  const transaction = await MetroCardModel.findCardTransactionById(id);
  return transformCardTransaction(transaction);
};

const getAllWalletTransactions = async () => {
  const transactions = await WalletModel.findAllWalletTransactions();
  return transactions.map(transformWalletTransaction);
};

const getAllCardTransactions = async () => {
  const transactions = await MetroCardModel.findAllCardTransactions();
  return transactions.map(transformCardTransaction);
};

// Combine both wallet and card transactions into a single object.
const getAllTransactions = async () => {
  const [walletTransactions, cardTransactions] = await Promise.all([
    WalletModel.findAllWalletTransactions(),
    MetroCardModel.findAllCardTransactions(),
  ]);

  return {
    wallet_transactions: walletTransactions.map(transformWalletTransaction),
    card_transactions: cardTransactions.map(transformCardTransaction),
  };
};

export {
  getWalletTransaction,
  getCardTransaction,
  getAllWalletTransactions,
  getAllCardTransactions,
  getAllTransactions,
};
