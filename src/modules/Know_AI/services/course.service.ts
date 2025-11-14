import { CourseModel } from '../models';
import { CourseVideoModel } from '../models';
import { OnsiteSessionModel } from '../models';
import type { CreateCourse, UpdateCourse } from '../types';
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

// still fix bug in update
const updateCourse = async (id: number, data: UpdateCourse) => {
  return await prisma.$transaction(async (tx) => {
    const course = await CourseModel.updateCourse(id, data);
    await CourseVideoModel.deleteCourseVideosByCourseId(id);
    await OnsiteSessionModel.deleteOnsiteSessionsByCourseId(id);

    if (
      (data.course_type === 'online' ||
        data.course_type === 'online_and_onsite') &&
      data.course_videos?.length
    ) {
      for (const video of data.course_videos) {
        await CourseVideoModel.createCourseVideo({
          ...video,
          course_id: course.id,
        });
      }
    }

    if (
      (data.course_type === 'onsite' ||
        data.course_type === 'online_and_onsite') &&
      data.onsite_sessions?.length
    ) {
      for (const session of data.onsite_sessions) {
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
        await OnsiteSessionModel.createOnsiteSession({
          ...session,
          course_id: course.id,
        });
      }
    }

    return course;
  });
};

const deleteCourse = async (id: number) => {
  return await prisma.$transaction(async (tx) => {
    await CourseVideoModel.deleteCourseVideosByCourseId(id);
    await OnsiteSessionModel.deleteOnsiteSessionsByCourseId(id);
    return await CourseModel.deleteCourse(id);
  });
};

export {
  createCourse,
  getAllCourse,
  getCourse,
  getCourseByType,
  updateCourse,
  deleteCourse,
};
