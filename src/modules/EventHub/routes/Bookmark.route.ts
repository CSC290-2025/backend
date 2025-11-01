import type { OpenAPIHono } from '@hono/zod-openapi';
import { BookmarkSchemas } from '../schemas';
import { BookmarkController } from '../controllers';

const setupBookmarkRoutes = (app: OpenAPIHono) => {
  // Bookmark Routes

  // Get all bookmarks (auth required)
  app.openapi(
    BookmarkSchemas.listBookmarksRoute,
    BookmarkController.listBookmarks
  );

  // Create a new bookmark (auth)
  app.openapi(
    BookmarkSchemas.createBookmarkRoute,
    BookmarkController.createBookmark
  );

  // Delete a bookmark (auth)
  app.openapi(
    BookmarkSchemas.deleteBookmarkRoute,
    BookmarkController.deleteBookmark
  );

  // Check if user bookmarked specific event (auth)
  app.openapi(
    BookmarkSchemas.checkBookmarkStatusRoute,
    BookmarkController.checkBookmarkStatus
  );
};

export { setupBookmarkRoutes };
