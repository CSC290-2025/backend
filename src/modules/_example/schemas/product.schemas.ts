import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { AuthMiddleware } from '@/middlewares';

// Zod schemas
const ProductSchema = z.object({
  id: z.cuid(), // can use cuid or uuid, more in zod docs
  name: z.string(),
  price: z.number(),
  category: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CreateProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string(),
});

const UpdateProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  price: z.number().positive('Price must be positive').optional(),
  category: z.string().optional(),
});

const ProductFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
});

const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['name', 'price', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedProductsSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const ProductsListSchema = z.object({
  products: z.array(ProductSchema),
});

const CategoryStatsSchema = z.object({
  stats: z.number(),
});

const PriceStatsSchema = z.object({
  stats: z.object({
    min: z.number(),
    max: z.number(),
    avg: z.number(),
    count: z.number(),
  }),
});

const ProductIdParam = z.object({
  id: z.string(),
});

const CategoryParam = z.object({
  category: z.string(),
});

// OpenAPI route definitions
const getProductRoute = createGetRoute({
  path: '/products/{id}',
  summary: 'Get product by ID',
  responseSchema: ProductSchema,
  params: ProductIdParam,
  tags: ['Products'],
  middleware: [AuthMiddleware.isUser],
});

const listProductsRoute = createGetRoute({
  path: '/products',
  summary: 'List products with pagination and filters',
  responseSchema: PaginatedProductsSchema,
  query: z.object({
    ...ProductFilterSchema.shape,
    ...PaginationSchema.shape,
  }),
  tags: ['Products'],
  middleware: [AuthMiddleware.isUser],
});

const getProductsByCategoryRoute = createGetRoute({
  path: '/products/category/{category}',
  summary: 'Get products by category',
  responseSchema: ProductsListSchema,
  params: CategoryParam,
  tags: ['Products'],
});

const getCategoryStatsRoute = createGetRoute({
  path: '/products/stats/categories',
  summary: 'Get product count by category',
  responseSchema: CategoryStatsSchema,
  tags: ['Products', 'Statistics'],
});

const getPriceStatsRoute = createGetRoute({
  path: '/products/stats/prices',
  summary: 'Get price statistics (min, max, avg, count)',
  responseSchema: PriceStatsSchema,
  tags: ['Products', 'Statistics'],
});

const adminCreateProductRoute = createPostRoute({
  path: '/admin/products',
  summary: 'Create new product (Admin)',
  requestSchema: CreateProductSchema,
  responseSchema: ProductSchema,
  tags: ['Admin', 'Products'],
  middleware: [AuthMiddleware.isAdmin],
});

const adminUpdateProductRoute = createPutRoute({
  path: '/admin/products/{id}',
  summary: 'Update product (Admin)',
  requestSchema: UpdateProductSchema,
  responseSchema: ProductSchema,
  params: ProductIdParam,
  tags: ['Admin', 'Products'],
  middleware: [AuthMiddleware.isAdmin],
});

const adminDeleteProductRoute = createDeleteRoute({
  path: '/admin/products/{id}',
  summary: 'Delete product (Admin)',
  params: ProductIdParam,
  tags: ['Admin', 'Products'],
  middleware: [AuthMiddleware.isAdmin],
});

export const ProductSchemas = {
  ProductSchema,
  CreateProductSchema,
  UpdateProductSchema,
  ProductFilterSchema,
  PaginationSchema,
  PaginatedProductsSchema,
  ProductsListSchema,
  CategoryStatsSchema,
  PriceStatsSchema,
  ProductIdParam,
  CategoryParam,
  getProductRoute,
  listProductsRoute,
  getProductsByCategoryRoute,
  getCategoryStatsRoute,
  getPriceStatsRoute,
  adminCreateProductRoute,
  adminUpdateProductRoute,
  adminDeleteProductRoute,
};
