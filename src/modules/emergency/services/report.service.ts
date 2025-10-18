import { PrismaClient } from '@/generated/prisma';

const g = globalThis as unknown as { __p?: PrismaClient };
const prisma = g.__p ?? (g.__p = new PrismaClient({ log: ['warn', 'error'] }));

export class ReportService {
  async create(
    input: {
      type: number | string;
      description?: string;
      imageUrl?: string;
      location: { latitude: number; longitude: number };
      ambulance?: boolean;
    },
    userId?: number
  ) {
    let categoryId: number | undefined;
    if (typeof input.type === 'number') {
      categoryId = input.type;
    } else {
      const rows = await prisma.$queryRaw<Array<{ id: number }>>`
        SELECT id FROM "report_categories" WHERE LOWER(name) = LOWER(${input.type}) LIMIT 1
      `;
      categoryId = rows[0]?.id;
      if (!categoryId) {
        const e: any = new Error('Unknown report type/category');
        e.status = 400;
        throw e;
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
        created_at: Date;
        updated_at: Date;
        level: string | null;
      }>
    >`
      INSERT INTO "emergency_reports"
        ("user_id","image_url","description","location","ambulance_service","report_category_id")
      VALUES (
        ${userId ?? null},
        ${input.imageUrl ?? null},
        ${input.description ?? null},
        ST_SetSRID(ST_MakePoint(${input.location.longitude}, ${input.location.latitude}), 4326),
        ${input.ambulance ?? false},
        ${categoryId ?? null}
      )
      RETURNING id, user_id, image_url, description, ambulance_service,
                report_category_id, status, level, created_at, updated_at
    `;
    return rows[0];
  }

  async getStatus(reportId: number) {
    return prisma.emergency_reports.findUnique({
      where: { id: reportId },
      select: { id: true, status: true },
    });
  }

  async setLevel(
    reportId: number,
    level: 'near_miss' | 'minor' | 'moderate' | 'major' | 'lethal'
  ) {
    return prisma.emergency_reports.update({
      where: { id: reportId },
      data: { level },
      select: { id: true, level: true, status: true, updated_at: true },
    });
  }

  async setStatusVerified(reportId: number) {
    return prisma.emergency_reports.update({
      where: { id: reportId },
      data: { status: 'verified' },
      select: { id: true, level: true, status: true, updated_at: true },
    });
  }

  async setStatusResolved(reportId: number) {
    return prisma.emergency_reports.update({
      where: { id: reportId },
      data: { status: 'resolved' },
      select: { id: true, level: true, status: true, updated_at: true },
    });
  }
}
