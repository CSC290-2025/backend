import {
  createPostRoute,
  createGetRoute,
  createDeleteRoute,
  createPutRoute,
} from '@/utils/openapi-helpers.ts';
import { ReportSchemas } from '@/modules/emergency/schemas';
import * as z from 'zod';
import { ReportResponseSchema } from '@/modules/emergency/schemas/report.schema.ts';

const createReportRoute = createPostRoute({
  path: '/emergency/reports',
  summary: 'Create new report',
  requestSchema: ReportSchemas.CreateReportSchema,
  responseSchema: ReportSchemas.ReportResponseSchema,
  tags: ['Report'],
});

const findReportByStatusRoute = createGetRoute({
  path: 'emergency/reports/{status}',
  summary: 'Get report pagination by status',
  params: z.object({
    status: ReportSchemas.ReportStatusEnum,
  }),
  query: z.object({
    _page: z.string().optional(),
    _limit: z.string().optional(),
  }),
  responseSchema: ReportSchemas.FindReportResponseSchema,
  tags: ['Report'],
});

const deleteReportByIdRoute = createDeleteRoute({
  path: '/emergency/reports/{id}',
  summary: 'Delete report by id',
  params: z.object({
    id: z.string(),
  }),
  tags: ['Report'],
});

const updateReportByIdRoute = createPutRoute({
  path: '/emergency/reports/{id}',
  summary: 'Update report by id',
  params: z.object({
    id: z.string(),
  }),
  requestSchema: ReportSchemas.UpdateReportByIdSchema,
  responseSchema: ReportSchemas.ReportResponseSchema,
  tags: ['Report'],
});

const findReportByIdRoute = createGetRoute({
  path: '/emergency/reports/{id}',
  summary: 'Find report by id',
  params: z.object({
    id: z.string(),
  }),
  responseSchema: z.any(),
  tags: ['Report'],
});

export {
  createReportRoute,
  findReportByStatusRoute,
  deleteReportByIdRoute,
  updateReportByIdRoute,
  findReportByIdRoute,
};
