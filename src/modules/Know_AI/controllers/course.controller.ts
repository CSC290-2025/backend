import type { Context } from 'hono';
import { CourseService } from '../services';
import { successResponse } from '@/utils/response';

const createCourse = async (c: Context) => {
  const body = await c.req.json();
  const report = await CourseService.createCourse(body);
  return successResponse(c, { report }, 201, 'Create course successfully');
};

const getAllCourse = async (c: Context) => {
  const courses = await CourseService.getAllCourse();
  return successResponse(c, { courses });
};

const getCourse = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const course = await CourseService.getCourse(id);
  return successResponse(c, { course });
};

const getCourseByType = async (c: Context) => {
  const type = c.req.param('type');
  const courses = await CourseService.getCourseByType(type);
  return successResponse(c, { courses });
};

const updateCourse = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const updatedCourse = await CourseService.updateCourse(id, body);
  return successResponse(
    c,
    { updatedCourse },
    200,
    'Course updated successfully'
  );
};

const deleteCourse = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const deletedCourse = await CourseService.deleteCourse(id);
  return successResponse(
    c,
    { deletedCourse },
    200,
    'Course deleted successfully'
  );
};

export {
  createCourse,
  getAllCourse,
  getCourse,
  getCourseByType,
  updateCourse,
  deleteCourse,
};
