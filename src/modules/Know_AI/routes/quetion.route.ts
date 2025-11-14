import { QuestionController } from '@/modules/Know_AI/controllers';
import { QuestionSchema } from '@/modules/Know_AI/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupQuestionRoutes = (app: OpenAPIHono) => {
  app.openapi(QuestionSchema.getQuestion, QuestionController.getQuestion);
};

export { setupQuestionRoutes };
