import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { adminMiddleware, authMiddleware } from '@/middlewares';
// import type { MiddlewareHandler } from 'hono';
// import { UnauthorizedError } from "@/errors/types";

// Admin middleware - checks role from query parameter or headers
// will use auth middleware later
// const requireAdmin: MiddlewareHandler = async (c, next) => {
//   const role = c.req.query('role') ?? '';

//   if (role.toLowerCase() !== 'admin') {
//     return new UnauthorizedError('Admin role required for this action');
//   }

//   await next();
// };

// Zod schemas
const CategorySchema = z.object({
  category_id: z.number(),
  category_name: z.string(),
  category_description: z.string().nullable(),
});

const ReportSchema = z.object({
  report_id: z.number(),
  title_string: z.string(),
  description_string: z.string().nullable(),
  category_id: z.number().nullable(),
  created_by: z.number().nullable(),
  last_updated_datetime: z.date().nullable(),
  power_bi_report_id_string: z.string().nullable(),
  visibility: z.enum(['citizens', 'admin', 'official']).nullable(),
  power_bi_report_type: z.enum(['summary', 'trends']).nullable(),
  // created_datetime: z.date().nullable(),
  // embedUrl: z.string().nullable().optional(),
  // dim_category: CategorySchema.nullable().optional(),
});

const CreateReportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  category: z.string().min(1, 'Category is required'),
  embedUrl: z.string().min(1, 'Embed URL is required'),
  visibility: z.enum(['citizens', 'admin']).optional(),
  type: z.enum(['summary', 'trends']).optional(),
});

const UpdateReportSchema = z.object({
  title: z.string().min(1, 'Title must be at least 1 character').optional(),
  description: z.string().nullable().optional(),
  category: z
    .string()
    .min(1, 'Category must be at least 1 character')
    .optional(),
  embedUrl: z.string().nullable().optional(),
  visibility: z.enum(['citizens', 'admin']).optional(),
  type: z.enum(['summary', 'trends']).optional(),
});

const ReportsByCategorySchema = z.record(
  z.string(),
  z.object({
    categoryId: z.number(),
    categoryName: z.string(),
    categoryDescription: z.string().nullable(),
    reports: z.array(ReportSchema),
  })
);

const ReportsListSchema = z.object({
  reports: z.array(ReportSchema),
});

const ReportsByCategoryResponseSchema = z.object({
  reports: ReportsByCategorySchema,
});

const ReportResponseSchema = z.object({
  report: ReportSchema,
});

const DeleteReportResponseSchema = z.object({
  message: z.string(),
});

const ReportIdParam = z.object({
  id: z.coerce.number().int().positive(),
});

const RoleQuery = z.object({
  role: z
    .enum(['citizens', 'admin'])
    .describe('User role for filtering reports'),
});

// OpenAPI route definitions
const getAllReportsRoute = createGetRoute({
  path: '/reports/all',
  summary: 'Get all report metadata',
  responseSchema: ReportsListSchema,
  tags: ['PowerBI - Reports'],
});

const getReportsByRoleRoute = createGetRoute({
  path: '/reports',
  summary: 'Get reports filtered by role and organized by category',
  responseSchema: ReportsByCategoryResponseSchema,
  query: RoleQuery,
  tags: ['PowerBI - Reports'],
});

const createReportRoute = createPostRoute({
  path: '/reports',
  summary: 'Create new report metadata (Admin only)',
  requestSchema: CreateReportSchema,
  responseSchema: ReportResponseSchema,
  tags: ['PowerBI - Reports'],
  // middleware: [authMiddleware, adminMiddleware],
});

const updateReportRoute = createPutRoute({
  path: '/reports/{id}',
  summary: 'Update report metadata (Admin only)',
  requestSchema: UpdateReportSchema,
  responseSchema: ReportResponseSchema,
  params: ReportIdParam,
  tags: ['PowerBI - Reports'],
  // middleware: [requireAdmin],
});

const deleteReportRoute = createDeleteRoute({
  path: '/reports/{id}',
  summary: 'Delete report metadata (Admin only)',
  params: ReportIdParam,
  tags: ['PowerBI - Reports'],
  // middleware: [requireAdmin],
});

export const ReportsSchemas = {
  ReportSchema,
  CategorySchema,
  CreateReportSchema,
  UpdateReportSchema,
  ReportsByCategorySchema,
  ReportsListSchema,
  ReportsByCategoryResponseSchema,
  ReportResponseSchema,
  DeleteReportResponseSchema,
  ReportIdParam,
  RoleQuery,
  getAllReportsRoute,
  getReportsByRoleRoute,
  createReportRoute,
  updateReportRoute,
  deleteReportRoute,
};
