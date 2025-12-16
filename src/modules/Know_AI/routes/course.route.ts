import { CourseController } from '@/modules/Know_AI/controllers';
import { UploadController } from '@/modules/Know_AI/controllers';
import { CourseSchema } from '@/modules/Know_AI/schemas';
import { UploadSchema } from '@/modules/Know_AI/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

export const setupCourseRoutes = (app: OpenAPIHono) => {
  app.openapi(CourseSchema.createAddressRoute, CourseController.createAddress);
  app.openapi(CourseSchema.createCourseRoute, CourseController.createCourse);
  app.openapi(CourseSchema.getAllCourseRoute, CourseController.getAllCourse);
  app.openapi(CourseSchema.getCourseRoute, CourseController.getCourse);
  app.openapi(
    CourseSchema.getCourseByTypeRoute,
    CourseController.getCourseByType
  );
  app.openapi(CourseSchema.updateCourseRoute, CourseController.updateCourse);
  app.openapi(
    CourseSchema.updateCourseVideosRoute,
    CourseController.updateCourseVideos
  );
  app.openapi(
    CourseSchema.updateOnsiteSessionsRoute,
    CourseController.updateOnsiteSessions
  );
  app.openapi(CourseSchema.deleteCourseRoute, CourseController.deleteCourse);
  app.openapi(
    UploadSchema.uploadDataRoute,
    UploadController.uploadGeneralFileController
  );
  app.openapi(
    UploadSchema.deleteDataRoute,
    UploadController.deleteGeneralFileController
  );
};
