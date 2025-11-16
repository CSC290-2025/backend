import { CourseController } from '@/modules/Know_AI/controllers';
import { CourseSchema } from '@/modules/Know_AI/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

export const setupCourseRoutes = (app: OpenAPIHono) => {
  app.openapi(CourseSchema.createCourseRoute, CourseController.createCourse);
  app.openapi(CourseSchema.getAllCourseRoute, CourseController.getAllCourse);
  app.openapi(CourseSchema.getCourseRoute, CourseController.getCourse);
  app.openapi(
    CourseSchema.getCourseByTypeRoute,
    CourseController.getCourseByType
  );
  app.openapi(CourseSchema.updateCourseRoute, CourseController.updateCourse);
  app.openapi(CourseSchema.deleteCourseRoute, CourseController.deleteCourse);
};
