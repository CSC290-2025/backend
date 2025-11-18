import { successResponse } from '@/utils/response';
import { listMarkers } from '../services/marker.service';

export const getMarkers = async (c: any) => {
  const url = new URL(c.req.url);
  const limit = Number(url.searchParams.get('limit') ?? 10);
  const items = await listMarkers(limit);
  return successResponse(c, { items }, 201, 'Get marker successfully');
  // c.json({ ok: true, items });
};
