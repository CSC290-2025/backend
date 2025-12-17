import { CourseModel } from '../models';
import { CourseVideoModel } from '../models';
import { OnsiteSessionModel } from '../models';
import type {
  CreateCourse,
  UpdateCourse,
  CreateCourseVideo,
  CreateOnsiteSession,
  addressSchema,
} from '../types';
import prisma from '@/config/client';

const createAddress = async (data: addressSchema) => {
  return await CourseModel.createAddress(data);
};

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
        data.course_videos.map((v: CreateCourseVideo) =>
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
        data.onsite_sessions.map((o: CreateOnsiteSession) =>
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

const updateCourse = async (
  id: number,
  data: UpdateCourse & {
    course_videos?: (CreateCourseVideo & { id?: number | null })[];
    onsite_sessions?: CreateOnsiteSession[];
  }
) => {
  return await prisma.$transaction(async (tx) => {
    const { course_videos, onsite_sessions, ...courseData } = data;

    const course = await CourseModel.updateCourse(id, courseData, tx);

    if (course_videos) {
      await updateCourseVideosLogic(id, course_videos, tx);
    }

    if (onsite_sessions) {
      await OnsiteSessionModel.deleteOnsiteSessionsByCourseId(id, tx);
      if (onsite_sessions.length > 0) {
        await OnsiteSessionModel.createMultipleOnsiteSessions(
          onsite_sessions.map((s: CreateOnsiteSession) => ({
            ...s,
            course_id: id,
          })),
          tx
        );
      }
    }

    return course;
  });
};

const updateCourseVideosLogic = async (
  courseId: number,
  videos: (CreateCourseVideo & { id?: number | null })[],
  tx: any
) => {
  const course = await tx.courses.findUnique({
    where: { id: courseId },
    select: { course_type: true },
  });

  if (!course) {
    throw new Error(`Course with id ${courseId} not found`);
  }

  if (course.course_type === 'onsite') {
    throw new Error('Cannot add videos to onsite-only course');
  }

  const existingVideos: { id: number }[] = await tx.course_videos.findMany({
    where: { course_id: courseId },
    select: { id: true },
  });
  const existingIds = new Set(existingVideos.map((v) => v.id));

  const videosToCreate = videos.filter((v) => !v.id);
  const videosToUpdate = videos.filter(
    (v): v is CreateCourseVideo & { id: number } =>
      typeof v.id === 'number' && existingIds.has(v.id)
  );
  const incomingIds = new Set(
    videos.map((v) => v.id).filter((id) => id !== undefined && id !== null)
  );

  const videosToDelete = existingVideos.filter((v) => !incomingIds.has(v.id));

  await Promise.all(
    videosToDelete.map((v: { id: number }) =>
      CourseVideoModel.deleteCourseVideo(v.id, tx)
    )
  );

  const newVideos = await CourseVideoModel.createMultipleCourseVideos(
    videosToCreate.map((v) => ({ ...v, course_id: courseId })),
    tx
  );

  const updatedVideos = await Promise.all(
    videosToUpdate.map((v) => {
      const dataToUpdate: Partial<CreateCourseVideo> = {
        video_name: v.video_name,
        video_description: v.video_description,
        duration_minutes: v.duration_minutes,
        video_order: v.video_order,
        video_file_path: v.video_file_path,
      };

      return CourseVideoModel.updateCourseVideo(v.id, dataToUpdate, tx);
    })
  );

  return [...newVideos, ...updatedVideos];
};

const updateCourseVideos = async (
  courseId: number,
  videos: (CreateCourseVideo & { id?: number | null })[]
) => {
  return await prisma.$transaction(async (tx) => {
    return await updateCourseVideosLogic(courseId, videos, tx);
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
const getApproveCourse = async () => CourseModel.getApproveCourse();
const changeApprove = async (id: number) => {
  return await CourseModel.changeApprove(id);
};

export {
  createAddress,
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
