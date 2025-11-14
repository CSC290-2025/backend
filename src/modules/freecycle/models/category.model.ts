import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { freecycle_categories } from '@/generated/prisma';
import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from '../types';

const transformCategory = (category: freecycle_categories): Category => ({
  ...category,
});

const findAll = async (): Promise<Category[]> => {
  try {
    const result = await prisma.freecycle_categories.findMany({
      orderBy: { created_at: 'desc' },
    });
    return result.map(transformCategory);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findById = async (id: number): Promise<Category> => {
  try {
    const result = await prisma.freecycle_categories.findUniqueOrThrow({
      where: { id },
    });
    return transformCategory(result);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findByName = async (name: string): Promise<Category | null> => {
  try {
    const result = await prisma.freecycle_categories.findUnique({
      where: { category_name: name },
    });
    return result ? transformCategory(result) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateCategoryData): Promise<Category> => {
  try {
    const result = await prisma.freecycle_categories.create({ data });
    return transformCategory(result);
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdateCategoryData
): Promise<Category> => {
  try {
    const result = await prisma.freecycle_categories.update({
      where: { id },
      data: { ...data, updated_at: new Date() },
    });
    return transformCategory(result);
  } catch (error) {
    handlePrismaError(error);
  }
};

const remove = async (id: number): Promise<void> => {
  try {
    await prisma.freecycle_categories.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findAll, findById, findByName, create, update, remove };
