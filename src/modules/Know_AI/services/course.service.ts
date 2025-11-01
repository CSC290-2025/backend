import { CourseModel } from '../models';
import type { Course, CourseId, CreateCourse } from '@/modules/Know_AI/types';

const createCourse = async (data: CreateCourse): Promise<Course> => {
  return await CourseModel.createCourse(data);
};

const getAllCourse = async (): Promise<Course[]> => {
  return await CourseModel.getAllCourse();
};

const getCourse = async (id: number): Promise<Course> => {
  return await CourseModel.getCourse(id);
};

export { createCourse, getAllCourse, getCourse };
