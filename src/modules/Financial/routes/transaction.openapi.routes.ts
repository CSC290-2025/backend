import { TransactionSchemas } from '../schemas';
import { TransactionController } from '../controllers';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupTransactionRoutes = (app: OpenAPIHono) => {
  app.openapi(
    TransactionSchemas.getWalletTransactionRoute,
    TransactionController.getWalletTransaction
  );
  app.openapi(
    TransactionSchemas.getCardTransactionRoute,
    TransactionController.getCardTransaction
  );
  app.openapi(
    TransactionSchemas.getAllWalletTransactionsRoute,
    TransactionController.getAllWalletTransactions
  );
  app.openapi(
    TransactionSchemas.getAllCardTransactionsRoute,
    TransactionController.getAllCardTransactions
  );
  app.openapi(
    TransactionSchemas.getAllTransactionsRoute,
    TransactionController.getAllTransactions
  );
};

export { setupTransactionRoutes };
