import type { OpenAPIHono } from '@hono/zod-openapi';
import { CategorySchemas } from '../schemas';
import { CategoryController } from '../controllers';

const setupCategoryRoutes = (app: OpenAPIHono) => {
  app.openapi(
    CategorySchemas.getAllCategoriesRoute,
    CategoryController.getAllCategories
  );
  app.openapi(
    CategorySchemas.getCategoryByIdRoute,
    CategoryController.getCategoryById
  );
  app.openapi(
    CategorySchemas.createCategoryRoute,
    CategoryController.createCategory
  );
  app.openapi(
    CategorySchemas.updateCategoryRoute,
    CategoryController.updateCategory
  );
  app.openapi(
    CategorySchemas.deleteCategoryRoute,
    CategoryController.deleteCategory
  );
};

export { setupCategoryRoutes };
