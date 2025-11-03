import type * as z from 'zod';
import type { CourseSchema } from '../schemas';

type Course = z.infer<typeof CourseSchema.course>;
type CourseId = z.infer<typeof CourseSchema.courseId>;
type CreateCourse = z.infer<typeof CourseSchema.createCourse>;

export type { Course, CourseId, CreateCourse };
