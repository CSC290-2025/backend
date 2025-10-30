import { OpenAPIHono } from '@hono/zod-openapi';
import { ProductSchemas } from '../schemas';
import { ProductController } from '../controllers';

const setupProductRoutes = (app: OpenAPIHono) => {
  // Public routes
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

  // Admin routes
  app.openapi(
    ProductSchemas.adminCreateProductRoute,
    ProductController.createProduct
  );
  app.openapi(
    ProductSchemas.adminUpdateProductRoute,
    ProductController.updateProduct
  );
  app.openapi(
    ProductSchemas.adminDeleteProductRoute,
    ProductController.deleteProduct
  );

  // User routes
  app.openapi(ProductSchemas.listProductsRoute, ProductController.listProducts);
  app.openapi(ProductSchemas.getProductRoute, ProductController.getProduct);
};

export { setupProductRoutes };
