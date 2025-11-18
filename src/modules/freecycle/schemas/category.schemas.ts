import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { createRoute } from '@hono/zod-openapi';

// Base Category Schema
const CategorySchema = z.object({
  id: z.number(),
  category_name: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Create Category
const CreateCategorySchema = z.object({
  category_name: z.string().min(1, 'Category name is required'),
});

// Update Category
const UpdateCategorySchema = z.object({
  category_name: z.string().optional(),
});

// Params
const CategoryIdParam = z.object({
  categoryId: z.coerce.number(),
});

// Routes
const createCategoryRoute = createPostRoute({
  path: '/categories',
  summary: 'Create a new category',
  requestSchema: CreateCategorySchema,
  responseSchema: z.object({ category: CategorySchema }),
  tags: ['Freecycle - Categories'],
});

const getAllCategoriesRoute = createGetRoute({
  path: '/categories',
  summary: 'Get all categories',
  responseSchema: z.object({ categories: z.array(CategorySchema) }),
  tags: ['Freecycle - Categories'],
});

const getCategoryByIdRoute = createGetRoute({
  path: '/categories/{categoryId}',
  summary: 'Get category by ID',
  params: CategoryIdParam,
  responseSchema: z.object({ category: CategorySchema }),
  tags: ['Freecycle - Categories'],
});

const updateCategoryRoute = createPutRoute({
  path: '/categories/{categoryId}',
  summary: 'Update category by ID',
  params: CategoryIdParam,
  requestSchema: UpdateCategorySchema,
  responseSchema: z.object({ category: CategorySchema }),
  tags: ['Freecycle - Categories'],
});

const deleteCategoryRoute = createDeleteRoute({
  path: '/categories/{categoryId}',
  summary: 'Delete category by ID',
  params: CategoryIdParam,
  tags: ['Freecycle - Categories'],
});

export const CategorySchemas = {
  CategorySchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  CategoryIdParam,
  createCategoryRoute,
  getAllCategoriesRoute,
  getCategoryByIdRoute,
  updateCategoryRoute,
  deleteCategoryRoute,
};
