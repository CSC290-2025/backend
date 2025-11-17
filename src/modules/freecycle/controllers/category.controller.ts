import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { CategoryService } from '../services';

const getAllCategories = async (c: Context) => {
  const categories = await CategoryService.getAllCategories();
  return successResponse(c, { categories });
};

const getCategoryById = async (c: Context) => {
  const id = Number(c.req.param('categoryId'));
  const category = await CategoryService.getCategoryById(id);
  return successResponse(c, { category });
};

const createCategory = async (c: Context) => {
  const body = await c.req.json();
  const category = await CategoryService.createCategory(body);
  return successResponse(c, { category }, 201, 'Category created successfully');
};

const updateCategory = async (c: Context) => {
  const id = Number(c.req.param('categoryId'));
  const body = await c.req.json();
  const category = await CategoryService.updateCategory(id, body);
  return successResponse(c, { category }, 200, 'Category updated successfully');
};

const deleteCategory = async (c: Context) => {
  const id = Number(c.req.param('categoryId'));
  await CategoryService.deleteCategory(id);
  return successResponse(c, {}, 200, 'Category deleted successfully');
};

export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
