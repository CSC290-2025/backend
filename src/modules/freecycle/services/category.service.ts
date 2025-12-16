import { CategoryModel } from '../models';
import { ValidationError, ConflictError, NotFoundError } from '@/errors';
import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from '../types';

const getAllCategories = async (): Promise<Category[]> => {
  return await CategoryModel.findAll();
};

const getCategoryById = async (id: number): Promise<Category> => {
  const category = await CategoryModel.findById(id);
  if (!category) throw new NotFoundError('Category not found');
  return category;
};

const createCategory = async (data: CreateCategoryData): Promise<Category> => {
  if (!data.category_name?.trim())
    throw new ValidationError('Category name is required');

  const existing = await CategoryModel.findByName(data.category_name);
  if (existing) throw new ConflictError('Category already exists');

  return await CategoryModel.create(data);
};

const updateCategory = async (
  id: number,
  data: UpdateCategoryData
): Promise<Category> => {
  const category = await CategoryModel.findById(id);
  if (!category) throw new NotFoundError('Category not found');
  return await CategoryModel.update(id, data);
};

const deleteCategory = async (id: number): Promise<void> => {
  const category = await CategoryModel.findById(id);
  if (!category) throw new NotFoundError('Category not found');
  await CategoryModel.remove(id);
};

export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
