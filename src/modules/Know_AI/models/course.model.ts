import prisma from '@/config/client.ts';
import { handlePrismaError } from '@/errors';
import type { Course, CourseId, CreateCourse } from '@/modules/Know_AI/types';

const createCourse = async (data: CreateCourse): Promise<Course> => {
  try {
    return await prisma.courses.create({
      data,
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const getAllCourse = async (): Promise<Course[]> => {
  try {
    return await prisma.courses.findMany();
  } catch (error) {
    handlePrismaError(error);
    return [];
  }
};

const getCourse = async (id: number): Promise<Course> => {
  try {
    const course = await prisma.courses.findUnique({
      where: {
        id,
      },
    });

    if (!course) {
      throw new Error(`Course with id ${id} not found`);
    }

    return course;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { createCourse, getAllCourse, getCourse };
