import type { Context } from 'hono';
import { CourseService } from '../services';
import { successResponse } from '@/utils/response';

const createCourse = async (c: Context) => {
  const body = await c.req.json();
  const report = await CourseService.createCourse(body);
  return successResponse(c, { report }, 201, 'Create reports successfully');
};

const getAllCourse = async (c: Context) => {
  const courses = await CourseService.getAllCourse();
  return successResponse(c, { courses });
};

const getCourse = async (c: Context) => {
  const courseId = Number(c.req.param('id'));
  const course = await CourseService.getCourse(courseId);
  return successResponse(c, { course });
};
export { createCourse, getAllCourse, getCourse };
