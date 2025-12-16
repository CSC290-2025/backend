import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const courseStatusEnum = z.enum(['pending', 'approve', 'not_approve']);
const courseTypeEnum = z.enum(['online', 'onsite', 'online_and_onsite']);

const addressSchema = z.object({
  address_line: z.string().max(255),
  province: z.string().max(100),
  district: z.string().max(100),
  subdistrict: z.string().max(100),
  postal_code: z.string().max(10),
});

const addressResponse = addressSchema.extend({
  id: z.number().int(),
});

const courseVideo = z.object({
  id: z.number().int().optional(),
  video_name: z.string().max(255),
  video_description: z.string().nullable(),
  duration_minutes: z.number(),
  video_order: z.number(),
  video_file_path: z.string().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
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

const course = z.object({
  id: z.number(),
  author_id: z.number().nullable(),
  course_name: z.string().max(255),
  course_description: z.string().nullable(),
  course_type: courseTypeEnum,
  course_status: courseStatusEnum.default('pending'),
  cover_image: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().optional(),
  course_videos: z.array(courseVideo).optional(),
  onsite_sessions: z.array(onsiteSession).optional(),
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

const updateCourse = z.object({
  author_id: z.number().nullable().optional(),
  course_name: z.string().max(255).optional(),
  course_description: z.string().nullable().optional(),
  course_type: courseTypeEnum.optional(),
  course_status: courseStatusEnum.optional(),
  cover_image: z.string().nullable().optional(),
});

const updateCourseVideos = z.object({
  course_videos: z.array(
    createCourseVideo.extend({
      id: z.number().int().nullable().optional(),
    })
  ),
});

const updateOnsiteSessions = z.object({
  onsite_sessions: z.array(createOnsiteSession),
});

const courseId = z.object({
  id: z.coerce.number(),
});

const courseVideoId = z.object({
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

// --- Route Schemas ---

const createAddressRoute = createPostRoute({
  path: '/address',
  summary: 'Create a new address',
  requestSchema: addressSchema,
  responseSchema: addressResponse,
  tags: ['Know-AI', 'Address'],
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
  summary: 'Update course basic information',
  requestSchema: updateCourse,
  responseSchema: course,
  params: courseId,
  tags: ['Know-AI', 'Course'],
});

const updateCourseVideosRoute = createPutRoute({
  path: '/course/{id}/videos',
  summary: 'Update course videos (Create/Update/Delete)',
  requestSchema: updateCourseVideos,
  responseSchema: z.object({
    course_videos: z.array(courseVideo),
  }),
  params: courseId,
  tags: ['Know-AI', 'Course'],
});

const updateOnsiteSessionsRoute = createPutRoute({
  path: '/course/{id}/sessions',
  summary: 'Update onsite sessions',
  requestSchema: updateOnsiteSessions,
  responseSchema: z.object({
    onsite_sessions: z.array(onsiteSession),
  }),
  params: courseId,
  tags: ['Know-AI', 'Course'],
});

const deleteCourseRoute = createDeleteRoute({
  path: '/course/{id}',
  summary: 'Delete course',
  params: courseId,
  tags: ['Know-AI', 'Course'],
});

const deleteCourseVideoRoute = createDeleteRoute({
  path: '/course_videos/{id}',
  summary: 'Delete a single course video',
  params: courseVideoId,
  tags: ['Know-AI', 'Course', 'Video'],
});

export {
  addressSchema,
  createAddressRoute,
  courseStatusEnum,
  courseTypeEnum,
  course,
  courseId,
  courseVideoId,
  courseVideo,
  onsiteSession,
  createCourseVideo,
  createOnsiteSession,
  updateCourseVideos,
  updateOnsiteSessions,
  createCourse,
  updateCourse,
  createCourseRoute,
  getAllCourseRoute,
  getCourseRoute,
  getCourseByTypeRoute,
  updateCourseRoute,
  updateCourseVideosRoute,
  updateOnsiteSessionsRoute,
  deleteCourseRoute,
  deleteCourseVideoRoute,
};
