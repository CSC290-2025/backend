import { CourseController } from '@/modules/Know_AI/controllers';
import { CourseSchema } from '@/modules/Know_AI/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupCourseRoutes = (app: OpenAPIHono) => {
  app.openapi(CourseSchema.createCourseRoute, CourseController.createCourse);
  app.openapi(CourseSchema.getAllCourseRoute, CourseController.getAllCourse);
  app.openapi(CourseSchema.getCourseRoute, CourseController.getCourse);
};

export { setupCourseRoutes };
