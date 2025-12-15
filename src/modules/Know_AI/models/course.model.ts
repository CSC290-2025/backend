import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { CreateCourse } from '@/modules/Know_AI/types';
import { CourseSchema } from '../schemas';

const createCourse = async (data: CreateCourse) => {
  try {
    const validatedData = CourseSchema.createCourse.parse(data);
    return await prisma.courses.create({ data: validatedData as any });
  } catch (error) {
    handlePrismaError(error);
  }
};

const getAllCourse = async () => {
  try {
    return await prisma.courses.findMany({
      include: { course_videos: true, onsite_sessions: true },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const getCourse = async (id: number) => {
  try {
    const course = await prisma.courses.findUnique({
      where: { id },
      include: { course_videos: true, onsite_sessions: true },
    });
    if (!course) throw new Error(`Course with id ${id} not found`);
    return course;
  } catch (error) {
    handlePrismaError(error);
  }
};

const getCourseByType = async (type: string) => {
  try {
    return await prisma.courses.findMany({
      where: { course_type: type as any },
      include: { course_videos: true, onsite_sessions: true },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateCourse = async (
  id: number,
  data: Partial<CreateCourse>,
  tx?: any
) => {
  try {
    const { course_videos, onsite_sessions, ...courseData } = data;
    const validatedData = CourseSchema.updateCourse.parse(courseData);

    const prismaClient = tx || prisma;
    return await prismaClient.courses.update({
      where: { id },
      data: validatedData as any,
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteCourse = async (id: number) => {
  try {
    return await prisma.courses.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  createCourse,
  getAllCourse,
  getCourse,
  getCourseByType,
  updateCourse,
  deleteCourse,
};
