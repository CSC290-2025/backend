import { Hono } from 'hono';
import { ReportService } from '../services/report.service';

type EnvVars = { Variables: { user?: { id: number; role_id?: number } } };

export const emergencyAdminRoutes = new Hono<EnvVars>();
const svc = new ReportService();

function assertId(idRaw: string) {
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) {
    const e: any = new Error('invalid id');
    e.status = 400;
    throw e;
  }
  return id;
}
function assertLevel(v: unknown) {
  const level = String(v ?? '').toLowerCase();
  // MUST match your Prisma enum report_level
  const allowed = ['near_miss', 'minor', 'moderate', 'major', 'lethal'];
  if (!allowed.includes(level)) {
    const e: any = new Error('invalid level');
    e.status = 400;
    throw e;
  }
  return level as 'near_miss' | 'minor' | 'moderate' | 'major' | 'lethal';
}

// PATCH /api/v1/emergency/admin/reports/:id/level
emergencyAdminRoutes.patch('/reports/:id/level', async (c) => {
  const id = assertId(c.req.param('id'));
  const body = await c.req.json().catch(() => ({}));
  const level = assertLevel(body.level);

  const current = await svc.getStatus(id);
  if (!current) {
    const e: any = new Error('Report not found');
    e.status = 404;
    throw e;
  }
  if (current.status !== 'pending') {
    const e: any = new Error('Cannot change level after review');
    e.status = 409;
    throw e;
  }

  const data = await svc.setLevel(id, level);
  return c.json({ ok: true, data });
});

// POST /api/v1/emergency/admin/reports/:id/approve  -> sets status = 'verified'
emergencyAdminRoutes.post('/reports/:id/approve', async (c) => {
  const id = assertId(c.req.param('id'));
  const current = await svc.getStatus(id);
  if (!current) {
    const e: any = new Error('Report not found');
    e.status = 404;
    throw e;
  }
  if (current.status !== 'pending') {
    const e: any = new Error('Already reviewed');
    e.status = 409;
    throw e;
  }
  const data = await svc.setStatusVerified(id);
  return c.json({ ok: true, data });
});

// POST /api/v1/emergency/admin/reports/:id/reject   -> map to status = 'resolved' (schema has no "rejected")
emergencyAdminRoutes.post('/reports/:id/reject', async (c) => {
  const id = assertId(c.req.param('id'));
  const current = await svc.getStatus(id);
  if (!current) {
    const e: any = new Error('Report not found');
    e.status = 404;
    throw e;
  }
  if (current.status !== 'pending') {
    const e: any = new Error('Already reviewed');
    e.status = 409;
    throw e;
  }
  const data = await svc.setStatusResolved(id);
  return c.json({ ok: true, data });
});
