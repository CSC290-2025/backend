import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import { Hono } from 'hono';
import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';

const g = globalThis as unknown as { __p?: PrismaClient };
const prisma = g.__p ?? (g.__p = new PrismaClient({ log: ['warn', 'error'] }));

const CreateBodySchema = z.object({
  type: z.union([z.number(), z.string()]),
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  ambulance: z.boolean().default(false),
  contactCenter: z.boolean().default(false),
});

const SuccessEnvelope = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    success: z.literal(true),
    data: schema,
    timestamp: z.string(),
    message: z.string().optional(),
  });

const ErrorEnvelope = z.object({
  success: z.literal(false),
  error: z.object({
    name: z.string(),
    message: z.string(),
    statusCode: z.number(),
  }),
  timestamp: z.string(),
});

const ReportRowSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  title: z.string(),
  image_url: z.string().nullable(),
  description: z.string().nullable(),
  ambulance_service: z.boolean().nullable(),
  contact_center_service: z.boolean().nullable(),
  report_category_id: z.number().nullable(),
  status: z.string().nullable(),
  level: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

async function resolveCategoryId(
  type: number | string
): Promise<number | undefined> {
  if (typeof type === 'number') return type;
  const rows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM "report_categories"
    WHERE LOWER(name) = LOWER(${type})
    LIMIT 1
  `;
  const id = rows[0]?.id;
  if (!id) {
    const e: any = new Error('Unknown report type/category');
    e.status = 400;
    throw e;
  }
  return id;
}

const nowIso = () => new Date().toISOString();

type ReportLevel = 'near_miss' | 'minor' | 'moderate' | 'major' | 'lethal';
const DEFAULT_LEVEL: ReportLevel = 'near_miss';

const createEmergencyReportRoute: RouteConfig = {
  method: 'post',
  path: '/api/v1/emergency/reports',
  summary: 'Create an emergency report',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: CreateBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Report created',
      content: {
        'application/json': { schema: SuccessEnvelope(ReportRowSchema) },
      },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: ErrorEnvelope } },
    },
    409: {
      description: 'Conflict',
      content: { 'application/json': { schema: ErrorEnvelope } },
    },
  },
  tags: ['Emergency'],
};

const createEmergencyReportHandler: RouteHandler<
  typeof createEmergencyReportRoute
> = async (c) => {
  const b = await c.req.json();
  try {
    const reportCategoryId = await resolveCategoryId(b.type);
    const userHeader = c.req.header('x-user-id');
    const userId =
      userHeader && Number.isInteger(Number(userHeader))
        ? Number(userHeader)
        : null;

    const rows = await prisma.$queryRaw<
      Array<{
        id: number;
        user_id: number | null;
        title: string;
        image_url: string | null;
        description: string | null;
        ambulance_service: boolean | null;
        contact_center_service: boolean | null;
        report_category_id: number | null;
        status: string | null;
        level: string | null;
        created_at: Date;
        updated_at: Date;
      }>
    >`
  INSERT INTO "emergency_reports"
    ("user_id",
     "image_url",
     "description",
     "title",
     "location",
     "ambulance_service",
     "contact_center_service",
     "report_category_id",
     "level",
     "status")
  VALUES (
    ${userId},
    ${b.imageUrl ?? null},        
    ${b.description ?? null},
    ${b.title},             
    ST_SetSRID(ST_MakePoint(${b.location.longitude}, ${b.location.latitude}), 4326),
    ${b.ambulance ?? false},
    ${b.contactCenter ?? false},
    ${reportCategoryId ?? null},
    ${DEFAULT_LEVEL}::report_level,
    'pending'::report_status
  )
  RETURNING id, user_id, title, image_url, description, ambulance_service, contact_center_service,
            report_category_id, status, level, created_at, updated_at
`;

    const row = rows[0];
    return c.json(
      {
        success: true,
        data: {
          ...row,
          created_at: row.created_at.toISOString(),
          updated_at: row.updated_at.toISOString(),
        },
        timestamp: nowIso(),
      },
      201
    );
  } catch (err: any) {
    const status = err?.status ?? 500;
    return c.json(
      {
        success: false,
        error: {
          name: err?.name ?? 'Error',
          message: err?.message ?? 'Internal error',
          statusCode: status,
        },
        timestamp: nowIso(),
      },
      status
    );
  }
};

export function setupEmergencyRoutes(app: OpenAPIHono) {
  app.openapi(createEmergencyReportRoute, createEmergencyReportHandler);

  const user = new Hono();

  const asInt = (v: unknown) =>
    Number.isFinite(Number(v)) ? Number(v) : undefined;
  const validStatus = new Set(['pending', 'verified', 'resolved']);

  user.get('/reports', async (c) => {
    try {
      const uidHdr = c.req.header('x-user-id');
      const userId =
        uidHdr && Number.isInteger(Number(uidHdr)) ? Number(uidHdr) : undefined;

      const statusQ = c.req.query('status');
      const status =
        statusQ && validStatus.has(statusQ)
          ? (statusQ as 'pending' | 'verified' | 'resolved')
          : undefined;

      const limit = Math.min(asInt(c.req.query('limit')) ?? 20, 100);
      const offset = asInt(c.req.query('offset')) ?? 0;

      const rows = await prisma.emergency_reports.findMany({
        where: {
          ...(userId ? { user_id: userId } : {}),
          ...(status ? { status } : !userId ? { status: 'verified' } : {}),
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          user_id: true,
          title: true,
          image_url: true,
          description: true,
          ambulance_service: true,
          contact_center_service: true,
          report_category_id: true,
          status: true,
          level: true,
          created_at: true,
          updated_at: true,
        },
      });

      const items = rows.map((r) => ({
        ...r,
        created_at: r.created_at.toISOString(),
        updated_at: r.updated_at.toISOString(),
      }));

      return c.json({
        success: true,
        data: { items, limit, offset, count: items.length },
        timestamp: nowIso(),
      });
    } catch (err: any) {
      const statusCode = err?.status ?? 500;
      return c.json(
        {
          success: false,
          error: {
            name: err?.name ?? 'Error',
            message: err?.message ?? 'Internal error',
            statusCode,
          },
          timestamp: nowIso(),
        },
        statusCode
      );
    }
  });

  user.get('/reports/:id', async (c) => {
    try {
      const id = Number(c.req.param('id'));
      if (!Number.isInteger(id) || id <= 0) {
        return c.json(
          {
            success: false,
            error: {
              name: 'BadRequest',
              message: 'invalid id',
              statusCode: 400,
            },
            timestamp: nowIso(),
          },
          400
        );
      }

      const uidHdr = c.req.header('x-user-id');
      const userId =
        uidHdr && Number.isInteger(Number(uidHdr)) ? Number(uidHdr) : undefined;

      const row = await prisma.emergency_reports.findUnique({
        where: { id },
        select: {
          id: true,
          user_id: true,
          title: true,
          image_url: true,
          description: true,
          ambulance_service: true,
          contact_center_service: true,
          report_category_id: true,
          status: true,
          level: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!row) {
        return c.json(
          {
            success: false,
            error: {
              name: 'NotFound',
              message: 'Report not found',
              statusCode: 404,
            },
            timestamp: nowIso(),
          },
          404
        );
      }

      const isOwner = userId && row.user_id === userId;
      const isPublic = row.status === 'verified';
      if (!isOwner && !isPublic) {
        return c.json(
          {
            success: false,
            error: {
              name: 'Forbidden',
              message: 'Not allowed to view this report',
              statusCode: 403,
            },
            timestamp: nowIso(),
          },
          403
        );
      }

      return c.json({
        success: true,
        data: {
          ...row,
          created_at: row.created_at.toISOString(),
          updated_at: row.updated_at.toISOString(),
        },
        timestamp: nowIso(),
      });
    } catch (err: any) {
      const statusCode = err?.status ?? 500;
      return c.json(
        {
          success: false,
          error: {
            name: err?.name ?? 'Error',
            message: err?.message ?? 'Internal error',
            statusCode,
          },
          timestamp: nowIso(),
        },
        statusCode
      );
    }
  });

  app.route('/api/v1/emergency', user);

  const admin = new Hono();

  admin.use('*', async (c, next) => {
    const roleId = Number(c.req.header('x-role-id'));
    if (!Number.isInteger(roleId) || roleId <= 0) {
      return c.json(
        {
          success: false,
          error: {
            name: 'Forbidden',
            message: 'Missing/invalid x-role-id',
            statusCode: 403,
          },
          timestamp: nowIso(),
        },
        403
      );
    }
    await next();
  });

  const parseId = (raw: string) => {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      const e: any = new Error('invalid id');
      e.status = 400;
      throw e;
    }
    return id;
  };

  const parseLevel = (v: unknown): ReportLevel => {
    const s = String(v ?? '').toLowerCase();
    if (!['near_miss', 'minor', 'moderate', 'major', 'lethal'].includes(s)) {
      const e: any = new Error('invalid level');
      e.status = 400;
      throw e;
    }
    return s as ReportLevel;
  };

  admin.patch('/reports/:id/level', async (c) => {
    try {
      const id = parseId(c.req.param('id'));
      const b = await c.req.json().catch(() => ({}));
      const level = parseLevel(b.level);

      const current = await prisma.emergency_reports.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!current) {
        return c.json(
          {
            success: false,
            error: {
              name: 'NotFound',
              message: 'Report not found',
              statusCode: 404,
            },
            timestamp: nowIso(),
          },
          404
        );
      }
      if (current.status !== 'pending') {
        return c.json(
          {
            success: false,
            error: {
              name: 'Conflict',
              message: 'Cannot change level after review',
              statusCode: 409,
            },
            timestamp: nowIso(),
          },
          409
        );
      }

      const updated = await prisma.emergency_reports.update({
        where: { id },
        data: { level, updated_at: new Date() },
        select: { id: true, level: true, status: true, updated_at: true },
      });

      return c.json({
        success: true,
        data: { ...updated, updated_at: updated.updated_at.toISOString() },
        timestamp: nowIso(),
      });
    } catch (err: any) {
      const status = err?.status ?? 500;
      return c.json(
        {
          success: false,
          error: {
            name: err?.name ?? 'Error',
            message: err?.message ?? 'Internal error',
            statusCode: status,
          },
          timestamp: nowIso(),
        },
        status
      );
    }
  });

  admin.post('/reports/:id/approve', async (c) => {
    try {
      const id = parseId(c.req.param('id'));

      const current = await prisma.emergency_reports.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!current) {
        return c.json(
          {
            success: false,
            error: {
              name: 'NotFound',
              message: 'Report not found',
              statusCode: 404,
            },
            timestamp: nowIso(),
          },
          404
        );
      }
      if (current.status !== 'pending') {
        return c.json(
          {
            success: false,
            error: {
              name: 'Conflict',
              message: 'Already reviewed',
              statusCode: 409,
            },
            timestamp: nowIso(),
          },
          409
        );
      }

      const updated = await prisma.emergency_reports.update({
        where: { id },
        data: { status: 'verified', updated_at: new Date() },
        select: { id: true, level: true, status: true, updated_at: true },
      });

      return c.json({
        success: true,
        data: { ...updated, updated_at: updated.updated_at.toISOString() },
        timestamp: nowIso(),
      });
    } catch (err: any) {
      const status = err?.status ?? 500;
      return c.json(
        {
          success: false,
          error: {
            name: err?.name ?? 'Error',
            message: err?.message ?? 'Internal error',
            statusCode: status,
          },
          timestamp: nowIso(),
        },
        status
      );
    }
  });

  admin.post('/reports/:id/reject', async (c) => {
    try {
      const id = parseId(c.req.param('id'));

      const current = await prisma.emergency_reports.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!current) {
        return c.json(
          {
            success: false,
            error: {
              name: 'NotFound',
              message: 'Report not found',
              statusCode: 404,
            },
            timestamp: nowIso(),
          },
          404
        );
      }
      if (current.status !== 'pending') {
        return c.json(
          {
            success: false,
            error: {
              name: 'Conflict',
              message: 'Already reviewed',
              statusCode: 409,
            },
            timestamp: nowIso(),
          },
          409
        );
      }

      const updated = await prisma.emergency_reports.update({
        where: { id },
        data: { status: 'resolved', updated_at: new Date() },
        select: { id: true, level: true, status: true, updated_at: true },
      });

      return c.json({
        success: true,
        data: { ...updated, updated_at: updated.updated_at.toISOString() },
        timestamp: nowIso(),
      });
    } catch (err: any) {
      const status = err?.status ?? 500;
      return c.json(
        {
          success: false,
          error: {
            name: err?.name ?? 'Error',
            message: err?.message ?? 'Internal error',
            statusCode: status,
          },
          timestamp: nowIso(),
        },
        status
      );
    }
  });

  app.route('/api/v1/emergency/admin', admin);
}
