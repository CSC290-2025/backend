import { createPostRoute } from '@/utils/openapi-helpers.ts';
import { ReportSchemas } from '@/modules/emergency/schemas';
import { authMiddleware } from '@/middlewares';

const createReportRoute = createPostRoute({
  path: '/report',
  summary: 'Create new report',
  requestSchema: ReportSchemas.CreateReportSchema,
  responseSchema: ReportSchemas.ReportResponseSchema,
  tags: [`report`],
});

export { createReportRoute };
