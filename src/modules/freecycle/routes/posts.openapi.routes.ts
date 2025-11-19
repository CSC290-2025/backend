import type { OpenAPIHono } from '@hono/zod-openapi';
import { FreecyclePostsSchemas } from '@/modules/freecycle/schemas';
import { PostsController } from '@/modules/freecycle/controllers';

const setupFreecyclePostsRoutes = (app: OpenAPIHono) => {
  app.openapi(
    FreecyclePostsSchemas.getFreecycleAllPostsRoute,
    PostsController.getAllPost
  );

  app.openapi(
    FreecyclePostsSchemas.getNotGivenPostsRoute,
    PostsController.getNotGivenPost
  );

  app.openapi(
    FreecyclePostsSchemas.getUserFreecyclePostsRoute,
    PostsController.getPostByDonater
  );

  app.openapi(
    FreecyclePostsSchemas.getFreecyclePostRoute,
    PostsController.getPostById
  );

  app.openapi(
    FreecyclePostsSchemas.createFreecyclePostsRoute,
    PostsController.createPost
  );
  app.openapi(
    FreecyclePostsSchemas.UpdateFreecyclePostsRoute,
    PostsController.updatePost
  );
  app.openapi(
    FreecyclePostsSchemas.DeleteFreecyclePostsRoute,
    PostsController.deletePost
  );

  app.openapi(
    FreecyclePostsSchemas.MarkAsGivenRoute,
    PostsController.markAsGiven
  );

  app.openapi(
    FreecyclePostsSchemas.MarkAsNotGivenRoute,
    PostsController.markAsNotGiven
  );

  app.openapi(
    FreecyclePostsSchemas.getPostsByCategoryRoute,
    PostsController.getPostsByCategory
  );
};

export { setupFreecyclePostsRoutes };
