import type { OpenAPIHono } from '@hono/zod-openapi';
import { ProductSchemas } from '../schemas';
import { ProductController } from '../controllers';

const setupProductRoutes = (app: OpenAPIHono) => {
  app.openapi(ProductSchemas.listProductsRoute, ProductController.listProducts);
  app.openapi(ProductSchemas.getProductRoute, ProductController.getProduct);
  app.openapi(
    ProductSchemas.createProductRoute,
    ProductController.createProduct
  );
  app.openapi(
    ProductSchemas.updateProductRoute,
    ProductController.updateProduct
  );
  app.openapi(
    ProductSchemas.deleteProductRoute,
    ProductController.deleteProduct
  );

  app.openapi(
    ProductSchemas.getProductsByCategoryRoute,
    ProductController.getProductsByCategory
  );
  app.openapi(
    ProductSchemas.getCategoryStatsRoute,
    ProductController.getCategoryStats
  );
  app.openapi(
    ProductSchemas.getPriceStatsRoute,
    ProductController.getPriceStats
  );
};

export { setupProductRoutes };
