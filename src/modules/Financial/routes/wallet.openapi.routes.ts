import { WalletSchemas } from '../schemas';
import { WalletController } from '../controllers';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupWalletRoutes = (app: OpenAPIHono) => {
  // Wallet routes
  app.openapi(WalletSchemas.createWalletRoute, WalletController.createWallet);
  app.openapi(
    WalletSchemas.getUserWalletsRoute,
    WalletController.getUserWallets
  );
  app.openapi(WalletSchemas.getWalletRoute, WalletController.getWallet);
  app.openapi(WalletSchemas.updateWalletRoute, WalletController.updateWallet);
  app.openapi(WalletSchemas.topUpBalanceRoute, WalletController.topUpBalance);
};

export { setupWalletRoutes };
