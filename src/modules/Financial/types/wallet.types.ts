import type { z } from 'zod';
import type { WalletSchemas } from '../schemas';

type Wallet = z.infer<typeof WalletSchemas.WalletSchema>;
type CreateWalletData = z.infer<typeof WalletSchemas.CreateWalletSchema>;
type UpdateWalletData = z.infer<typeof WalletSchemas.UpdateWalletSchema>;
type TopUpBalanceData = z.infer<typeof WalletSchemas.TopUpBalanceSchema>;
type TransferFundsData = z.infer<typeof WalletSchemas.TransferFundsSchema>;
type OrganizationType = z.infer<typeof WalletSchemas.OrganizationTypeEnum>;

export type {
  Wallet,
  CreateWalletData,
  UpdateWalletData,
  TopUpBalanceData,
  TransferFundsData,
  OrganizationType,
};
