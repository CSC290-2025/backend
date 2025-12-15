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
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const course = await CourseService.updateCourse(id, body);
  return successResponse(c, { course }, 200, 'Course updated successfully');
};

const updateCourseVideos = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const course_videos = await CourseService.updateCourseVideos(
    id,
    body.course_videos
  );
  return successResponse(
    c,
    { course_videos },
    200,
    'Course videos updated successfully'
  );
};

const updateOnsiteSessions = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const onsite_sessions = await CourseService.updateOnsiteSessions(
    id,
    body.onsite_sessions
  );
  return successResponse(
    c,
    { onsite_sessions },
    200,
    'Onsite sessions updated successfully'
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

//Admin
const getPendingCourse = async (c: Context) => {
  const courses = await CourseService.getPendingCourse();
  return successResponse(c, { courses });
};

const getApproveCourse = async (c: Context) => {
  const courses = await CourseService.getApproveCourse();
  return successResponse(c, { courses });
};

const changeApprove = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const course = await CourseService.changeApprove(id);
  return successResponse(c, { course }, 200, 'Course approved successfully');
};

export {
  createCourse,
  getAllCourse,
  getCourse,
  getCourseByType,
  updateCourse,
  updateCourseVideos,
  updateOnsiteSessions,
  deleteCourse,
  getPendingCourse,
  getApproveCourse,
  changeApprove,
};
