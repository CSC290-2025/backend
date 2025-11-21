import { ExerciseController } from '@/modules/Know_AI/controllers';
import { ExerciseSchema } from '@/modules/Know_AI/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupExerciseRoute = (app: OpenAPIHono) => {
  app.openapi(ExerciseSchema.getExercise, ExerciseController.getExercise);
  app.openapi(
    ExerciseSchema.createSubmitAnswer,
    ExerciseController.submitAnswer
  );
  app.openapi(ExerciseSchema.getProgress, ExerciseController.getProgress);
};

export { setupExerciseRoute };
