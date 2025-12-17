import type * as z from 'zod';
import type { CourseSchema } from '../schemas';

type addressSchema = z.infer<typeof CourseSchema.addressSchema>;
type Course = z.infer<typeof CourseSchema.course>;
type CourseId = z.infer<typeof CourseSchema.courseId>;
type OnsiteSession = z.infer<typeof CourseSchema.onsiteSession>;
type CourseVideo = z.infer<typeof CourseSchema.courseVideo>;
type CreateCourseVideo = z.infer<typeof CourseSchema.createCourseVideo>;
type CreateOnsiteSession = z.infer<typeof CourseSchema.createOnsiteSession>;
type UpdateCourseVideos = z.infer<typeof CourseSchema.updateCourseVideos>;
type UpdateOnsiteSessions = z.infer<typeof CourseSchema.updateOnsiteSessions>;
type CreateCourse = z.infer<typeof CourseSchema.createCourse>;
type UpdateCourse = z.infer<typeof CourseSchema.updateCourse>;
type courseTypeEnum = z.infer<typeof CourseSchema.courseTypeEnum>;
type courseStatus = z.infer<typeof CourseSchema.courseStatus>;

export type {
  addressSchema,
  Course,
  CourseId,
  CreateCourse,
  UpdateCourse,
  courseTypeEnum,
  CourseVideo,
  CreateCourseVideo,
  OnsiteSession,
  CreateOnsiteSession,
  UpdateCourseVideos,
  UpdateOnsiteSessions,
  courseStatus,
};
