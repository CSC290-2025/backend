import { createPostRoute, createGetRoute } from '@/utils/openapi-helpers.ts';
import { ReportSchemas } from '@/modules/emergency/schemas';
import { authMiddleware } from '@/middlewares';
import * as z from 'zod';

const createReportRoute = createPostRoute({
  path: '/reports',
  summary: 'Create new report',
  requestSchema: ReportSchemas.CreateReportSchema,
  responseSchema: ReportSchemas.ReportResponseSchema,
  tags: [`Report`],
});

const findReportByStatusRoute = createGetRoute({
  path: `/reports/:status`,
  summary: 'Get report by status',
  params: z.object({
    status: ReportSchemas.ReportStatusEnum,
  }),
  query: z.object({
    _page: z.string().optional(),
    _limit: z.string().optional(),
  }),
  responseSchema: ReportSchemas.FindReportResponseSchema,
  tags: [`Report`],
});

export { createReportRoute, findReportByStatusRoute };
