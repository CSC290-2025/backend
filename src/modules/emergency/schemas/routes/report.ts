import { createPostRoute } from '@/utils/openapi-helpers.ts';
import { ReportSchemas } from '@/modules/emergency/schemas';

const createReportRoute = createPostRoute({
  path: '/reports',
  summary: 'Create new reports',
  requestSchema: ReportSchemas.CreateReportSchema,
  responseSchema: ReportSchemas.ReportResponseSchema,
  tags: [`report`],
});

export { createReportRoute };
