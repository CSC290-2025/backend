import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const courseStatusEnum = z.enum(['pending', 'approve', 'not_approve']);
const courseTypeEnum = z.enum(['online', 'onsite', 'online_and_onsite']);

const courseVideo = z.object({
  video_name: z.string().max(255),
  video_description: z.string().nullable(),
  duration_minutes: z.number(),
  video_order: z.number(),
  video_file_path: z.string().nullable(),
});

const onsiteSession = z.object({
  id: z.number().int(),
  course_id: z.number().int().nullable(),
  address_id: z.number().int().nullable(),
  duration_hours: z.number().nullable(),
  event_at: z.coerce.date(),
  registration_deadline: z.coerce.date(),
  total_seats: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const createCourseVideo = z.object({
  video_name: z.string().max(255),
  video_description: z.string().nullable(),
  duration_minutes: z.number(),
  video_order: z.number(),
  video_file_path: z.string().nullable(),
});

const createOnsiteSession = z.object({
  address_id: z.number().nullable(),
  duration_hours: z.number().nullable(),
  event_at: z.coerce.date(),
  registration_deadline: z.coerce.date(),
  total_seats: z.number().int().default(1),
});

const createCourseVideoDB = createCourseVideo.extend({
  course_id: z.number(),
});

const createOnsiteSessionDB = createOnsiteSession.extend({
  course_id: z.number(),
});

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
  course_videos: z.array(courseVideo).optional(),
  onsite_sessions: z.array(onsiteSession).optional(),
});

const courseId = z.object({
  id: z.coerce.number(),
});

const courseTypeParam = z.object({
  type: courseTypeEnum,
});

const createCourse = z.object({
  author_id: z.number().nullable(),
  course_name: z.string().max(255),
  course_description: z.string().nullable(),
  course_type: courseTypeEnum,
  course_status: courseStatusEnum.default('pending'),
  cover_image: z.string().nullable(),
  course_videos: z.array(createCourseVideo).optional(),
  onsite_sessions: z.array(createOnsiteSession).optional(),
});

const updateCourse = createCourse.partial();

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
  summary: 'Get course by id',
  responseSchema: course,
  params: courseId,
  tags: ['Know-AI', 'Course'],
});

const getCourseByTypeRoute = createGetRoute({
  path: '/course/type/{type}',
  summary: 'Get course by type',
  responseSchema: course.array(),
  params: courseTypeParam,
  tags: ['Know-AI', 'Course'],
});

const updateCourseRoute = createPutRoute({
  path: '/course/{id}',
  summary: 'Update course',
  requestSchema: updateCourse,
  responseSchema: course,
  params: courseId,
  tags: ['Know-AI', 'Course'],
});

const deleteCourseRoute = createDeleteRoute({
  path: '/course/{id}',
  summary: 'Delete course',
  params: courseId,
  tags: ['Know-AI', 'Course'],
});

export {
  courseStatusEnum,
  courseTypeEnum,
  course,
  courseId,
  courseVideo,
  onsiteSession,
  createCourseVideo,
  createOnsiteSession,
  createCourseVideoDB,
  createOnsiteSessionDB,
  createCourse,
  updateCourse,
  createCourseRoute,
  getAllCourseRoute,
  getCourseRoute,
  getCourseByTypeRoute,
  updateCourseRoute,
  deleteCourseRoute,
};
