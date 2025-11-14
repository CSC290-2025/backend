import { LevelController } from '@/modules/Know_AI/controllers';
import { LevelSchema } from '@/modules/Know_AI/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupLevelRoutes = (app: OpenAPIHono) => {
  app.openapi(LevelSchema.getUserLevel, LevelController.getLevel);
};

export { setupLevelRoutes };
