import { OpenAPIHono } from '@hono/zod-openapi';
import { ProductSchemas } from '../schemas';
import { ProductController } from '../controllers';
import { AuthMiddleware } from '@/middlewares';

const setupProductRoutes = (app: OpenAPIHono) => {
  // Gotta mount more specific paths first, then general paths, so middleware doesn’t overwrite unrelated routes.
  // Routes that don't require specific middlewares (or use global middlewares)
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

  // Routes that require AuthMiddleware.isAdmin
  const adminRoutes = new OpenAPIHono();
  adminRoutes.use(AuthMiddleware.isAdmin);
  adminRoutes.openapi(
    ProductSchemas.adminCreateProductRoute,
    ProductController.createProduct
  );
  adminRoutes.openapi(
    ProductSchemas.adminUpdateProductRoute,
    ProductController.updateProduct
  );
  adminRoutes.openapi(
    ProductSchemas.adminDeleteProductRoute,
    ProductController.deleteProduct
  );
  app.route('/admin', adminRoutes);

  // Routes that require AuthMiddleware.isUser
  const userRoutes = new OpenAPIHono();
  userRoutes.use(AuthMiddleware.isUser);
  userRoutes.openapi(
    ProductSchemas.listProductsRoute,
    ProductController.listProducts
  );
  userRoutes.openapi(
    ProductSchemas.getProductRoute,
    ProductController.getProduct
  );
  app.route('/', userRoutes);
};

export { setupProductRoutes };
