import type { OpenAPIHono } from '@hono/zod-openapi';
import { FreecyclePostsCategoriesSchemas } from '@/modules/freecycle/schemas';
import { PostCategoriesController } from '@/modules/freecycle/controllers';

const setupFreecyclePostCategoriesPostRoutes = (app: OpenAPIHono) => {
  app.openapi(
    FreecyclePostsCategoriesSchemas.getPostCategoriesRoute,
    PostCategoriesController.getCategoriesByPostId
  );

  app.openapi(
    FreecyclePostsCategoriesSchemas.addCategoryToPostRoute,
    PostCategoriesController.addCategoryToPost
  );

  app.openapi(
    FreecyclePostsCategoriesSchemas.addCategoriesToPostRoute,
    PostCategoriesController.addCategoriesToPost
  );

  app.openapi(
    FreecyclePostsCategoriesSchemas.removeCategoriesFromPostRoute,
    PostCategoriesController.removeCategoryFromPost
  );
};

export { setupFreecyclePostCategoriesPostRoutes };
