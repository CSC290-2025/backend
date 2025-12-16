import type { OpenAPIHono } from '@hono/zod-openapi';
import { BookmarkSchemas } from '../schemas';
import { BookmarkController } from '../controllers';
import { authMiddleware } from '@/middlewares/auth'; // Importing the middleware

const setupBookmarkRoutes = (app: OpenAPIHono) => {
  // Bookmark Routes

  // Get all bookmarks (auth required)
  app.openapi(
    BookmarkSchemas.listBookmarksRoute,
    authMiddleware, // Applying authMiddleware
    BookmarkController.listBookmarks
  );

  // Create a new bookmark (auth)
  app.openapi(
    BookmarkSchemas.createBookmarkRoute,
    authMiddleware, // Applying authMiddleware
    BookmarkController.createBookmark
  );

  // Delete a bookmark (auth)
  app.openapi(
    BookmarkSchemas.deleteBookmarkRoute,
    authMiddleware, // Applying authMiddleware
    BookmarkController.deleteBookmark
  );

  // Check if user bookmarked specific event (auth)
  app.openapi(
    BookmarkSchemas.checkBookmarkStatusRoute,
    authMiddleware, // Applying authMiddleware
    BookmarkController.checkBookmarkStatus
  );

  app.openapi(
    BookmarkSchemas.getBookmarkedUsersRoute,
    authMiddleware, // Applying authMiddleware
    BookmarkController.getBookmarkedUsers
  );
};

export { setupBookmarkRoutes };
