import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { CourseVideo, CreateCourseVideo } from '@/modules/Know_AI/types';

const getAllCourseVideos = async (): Promise<CourseVideo[]> => {
  try {
    return await prisma.course_videos.findMany({
      orderBy: { video_order: 'asc' },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const getCourseVideoById = async (id: number): Promise<CourseVideo> => {
  try {
    return await prisma.course_videos.findUniqueOrThrow({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const createCourseVideo = async (
  data: CreateCourseVideo
): Promise<CourseVideo> => {
  try {
    return await prisma.course_videos.create({ data });
  } catch (error) {
    handlePrismaError(error);
  }
};

const createMultipleCourseVideos = async (
  videos: CreateCourseVideo[]
): Promise<CourseVideo[]> => {
  try {
    const results = await Promise.all(
      videos.map(async (video) => {
        return await prisma.course_videos.create({ data: video });
      })
    );
    return results;
  } catch (error) {
    handlePrismaError(error);
    throw error;
  }
};

const deleteCourseVideo = async (id: number): Promise<CourseVideo> => {
  try {
    return await prisma.course_videos.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteCourseVideosByCourseId = async (
  courseId: number
): Promise<{ count: number }> => {
  try {
    return await prisma.course_videos.deleteMany({
      where: { course_id: courseId },
    });
  } catch (error) {
    handlePrismaError(error);
    throw error;
  }
};

export {
  getAllCourseVideos,
  getCourseVideoById,
  createCourseVideo,
  createMultipleCourseVideos,
  deleteCourseVideo,
  deleteCourseVideosByCourseId,
};
