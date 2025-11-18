import { ExerciseController } from '@/modules/Know_AI/controllers';
import { ExerciseSchema } from '@/modules/Know_AI/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupExerciseRoute = (app: OpenAPIHono) => {
  app.openapi(ExerciseSchema.getExercise, ExerciseController.getExercise);
};

export { setupExerciseRoute };
