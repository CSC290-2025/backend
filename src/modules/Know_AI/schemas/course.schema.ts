import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const courseStatusEnum = z.enum(['pending', 'approve', 'not_approve']);
const courseTypeEnum = z.enum(['online', 'onsite', 'online_and_onsite']);

const course = z.object({
  id: z.number(),
  author_id: z.number().nullable(),
  course_name: z.string().max(255),
  course_description: z.string().nullable(),
  course_type: courseTypeEnum,
  course_status: courseStatusEnum.default('pending'),
  cover_image: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date().optional(),
  course_videos: z.array(z.unknown()).optional(),
  users: z.unknown().optional(),
  onsite_sessions: z.array(z.unknown()).optional(),
});

const courseId = z.object({
  id: z.coerce.number(),
});

const createCourse = z.object({
  author_id: z.number().nullable(),
  course_name: z.string().max(255),
  course_description: z.string().nullable(),
  course_type: courseTypeEnum,
  course_status: courseStatusEnum.default('pending'),
  cover_image: z.string().nullable(),
});

const createCourseRoute = createPostRoute({
  path: '/createCourse',
  summary: 'Create course',
  requestSchema: createCourse,
  responseSchema: course,
  tags: ['Know-AI', 'Course'],
});

const getAllCourseRoute = createGetRoute({
  path: '/courses',
  summary: 'Get all courses',
  responseSchema: course.array(),
  tags: ['Know-AI', 'Course'],
});

const getCourseRoute = createGetRoute({
  path: '/course/{id}',
  summary: 'Get course',
  responseSchema: course,
  params: courseId,
  tags: ['Know-AI', 'Course'],
});

export {
  courseStatusEnum,
  courseTypeEnum,
  course,
  courseId,
  createCourse,
  createCourseRoute,
  getAllCourseRoute,
  getCourseRoute,
};
