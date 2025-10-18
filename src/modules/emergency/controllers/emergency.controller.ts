import type { RouteHandler } from '@hono/zod-openapi';
import type { EmergencySchemas } from '@/modules/emergency/schemas';
import { PrismaClient } from '@/generated/prisma';

const g = globalThis as unknown as { __p?: PrismaClient };
const prisma = g.__p ?? (g.__p = new PrismaClient({ log: ['warn', 'error'] }));

export const createReport: RouteHandler<
  typeof EmergencySchemas.createEmergencyReportRoute
> = async (c) => {
  const body = c.req.valid('json');

  const userIdHeader = c.req.header('x-user-id');
  const userId =
    userIdHeader && Number.isInteger(Number(userIdHeader))
      ? Number(userIdHeader)
      : undefined;

  let reportCategoryId: number | undefined;
  if (typeof body.type === 'number') {
    reportCategoryId = body.type;
  } else {
    const found = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM "report_categories"
      WHERE LOWER(name) = LOWER(${body.type})
      LIMIT 1
    `;
    reportCategoryId = found[0]?.id;
    if (!reportCategoryId) {
      return c.json(
        {
          success: false,
          error: {
            name: 'BadRequest',
            message: 'Unknown report type/category',
            statusCode: 400,
          },
          timestamp: new Date().toISOString(),
        },
        400
      );
    }
  }

  const rows = await prisma.$queryRaw<
    Array<{
      id: number;
      user_id: number | null;
      image_url: string | null;
      description: string | null;
      ambulance_service: boolean | null;
      report_category_id: number | null;
      status: string | null;
      level: string | null;
      created_at: Date;
      updated_at: Date;
    }>
  >`
    INSERT INTO "emergency_reports"
      ("user_id","image_url","description","location","ambulance_service","report_category_id")
    VALUES (
      ${userId ?? null},
      ${body.imageUrl ?? null},
      ${body.description ?? null},
      ST_SetSRID(ST_MakePoint(${body.location.longitude}, ${body.location.latitude}), 4326),
      ${body.ambulance ?? false},
      ${reportCategoryId ?? null}
    )
    RETURNING id, user_id, image_url, description, ambulance_service,
              report_category_id, status, level, created_at, updated_at
  `;

  const row = rows[0];

  return c.json(
    {
      success: true,
      data: {
        id: row.id,
        user_id: row.user_id,
        image_url: row.image_url,
        description: row.description,
        ambulance_service: row.ambulance_service,
        report_category_id: row.report_category_id,
        status: row.status,
        level: row.level,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString(),
      },
      timestamp: new Date().toISOString(),
    },
    201
  );
};

export const EmergencyController = { createReport };
