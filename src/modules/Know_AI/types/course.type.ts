import type * as z from 'zod';
import type { CourseSchema } from '../schemas';

type Course = z.infer<typeof CourseSchema.course>;
type CourseId = z.infer<typeof CourseSchema.courseId>;
type OnsiteSession = z.infer<typeof CourseSchema.onsiteSession>;
type CourseVideo = z.infer<typeof CourseSchema.courseVideo>;
type CreateCourseVideo = z.infer<typeof CourseSchema.createCourseVideo>;
type CreateOnsiteSession = z.infer<typeof CourseSchema.createOnsiteSession>;
type CreateCourseVideoDB = z.infer<typeof CourseSchema.createCourseVideoDB>;
type CreateOnsiteSessionDB = z.infer<typeof CourseSchema.createOnsiteSessionDB>;
type CreateCourse = z.infer<typeof CourseSchema.createCourse>;
type UpdateCourse = z.infer<typeof CourseSchema.updateCourse>;
type courseTypeEnum = z.infer<typeof CourseSchema.courseTypeEnum>;

export type {
  Course,
  CourseId,
  CreateCourse,
  UpdateCourse,
  courseTypeEnum,
  CourseVideo,
  CreateCourseVideo,
  OnsiteSession,
  CreateOnsiteSession,
  CreateCourseVideoDB,
  CreateOnsiteSessionDB,
};
