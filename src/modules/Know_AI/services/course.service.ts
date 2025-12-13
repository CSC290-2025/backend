import { CourseModel } from '../models';
import { CourseVideoModel } from '../models';
import { OnsiteSessionModel } from '../models';
import type {
  CreateCourse,
  UpdateCourse,
  CreateCourseVideo,
  CreateOnsiteSession,
} from '../types';
import prisma from '@/config/client';

const createCourse = async (data: CreateCourse) => {
  return await prisma.$transaction(async (tx) => {
    const course = await CourseModel.createCourse({
      author_id: data.author_id,
      course_name: data.course_name,
      course_description: data.course_description,
      course_type: data.course_type,
      cover_image: data.cover_image,
      course_status: 'pending',
    });

    if (
      (data.course_type === 'online' ||
        data.course_type === 'online_and_onsite') &&
      data.course_videos?.length
    ) {
      await Promise.all(
        data.course_videos.map((v) =>
          prisma.course_videos.create({ data: { ...v, course_id: course.id } })
        )
      );
    }

    if (
      (data.course_type === 'onsite' ||
        data.course_type === 'online_and_onsite') &&
      data.onsite_sessions?.length
    ) {
      await Promise.all(
        data.onsite_sessions.map((o) =>
          prisma.onsite_sessions.create({
            data: { ...o, course_id: course.id },
          })
        )
      );
    }

    return course;
  });
};

const getAllCourse = async () => CourseModel.getAllCourse();
const getCourse = async (id: number) => CourseModel.getCourse(id);
const getCourseByType = async (type: string) =>
  CourseModel.getCourseByType(type);
const updateCourse = async (id: number, data: UpdateCourse) => {
  return await CourseModel.updateCourse(id, data);
};

const updateCourseVideos = async (
  courseId: number,
  videos: CreateCourseVideo[]
) => {
  return await prisma.$transaction(async (tx) => {
    await CourseVideoModel.deleteCourseVideosByCourseId(courseId, tx);
    if (videos.length > 0) {
      return await CourseVideoModel.createMultipleCourseVideos(
        videos.map((v) => ({ ...v, course_id: courseId })),
        tx
      );
    }
    return [];
  });
};

const updateOnsiteSessions = async (
  courseId: number,
  sessions: CreateOnsiteSession[]
) => {
  return await prisma.$transaction(async (tx) => {
    const course = await tx.courses.findUnique({
      where: { id: courseId },
      select: { course_type: true },
    });

    if (!course) {
      throw new Error(`Course with id ${courseId} not found`);
    }

    if (course.course_type === 'online') {
      throw new Error('Cannot add onsite sessions to online-only course');
    }

    for (const session of sessions) {
      if (session.address_id) {
        const addressExists = await tx.addresses.findUnique({
          where: { id: session.address_id },
        });
        if (!addressExists) {
          throw new Error(
            `Address with id ${session.address_id} does not exist`
          );
        }
      }
    }

    await OnsiteSessionModel.deleteOnsiteSessionsByCourseId(courseId, tx);

    if (sessions.length > 0) {
      return await OnsiteSessionModel.createMultipleOnsiteSessions(
        sessions.map((s) => ({ ...s, course_id: courseId })),
        tx
      );
    }
    return [];
  });
};

const deleteCourse = async (id: number) => {
  return await prisma.$transaction(async (tx) => {
    await CourseVideoModel.deleteCourseVideosByCourseId(id);
    await OnsiteSessionModel.deleteOnsiteSessionsByCourseId(id);
    return await CourseModel.deleteCourse(id);
  });
};

//Admin
const getPendingCourse = async () => CourseModel.getPendingCourse();
const changeApprove = async (id: number) => {
  return await CourseModel.changeApprove(id);
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
  changeApprove,
};
