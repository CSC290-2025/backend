import { ownerService } from '../service';
import type { Context } from 'hono';
import { successResponse } from '@/utils/response';

export async function getApartmentOwnerByApartmentId(c: Context) {
  const apartment_id = Number(c.req.param('id'));
  const owners =
    await ownerService.getApartmentOwnerByApartmentId(apartment_id);
  return successResponse(c, owners, 200);
}
