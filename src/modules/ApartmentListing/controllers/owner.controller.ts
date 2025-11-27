import { ownerService } from '../service';
import type { Context } from 'hono';
import { successResponse } from '@/utils/response';

export async function getApartmentOwnerByApartmentId(c: Context) {
  const apartment_id = Number(c.req.param('id'));
  const owners =
    await ownerService.getApartmentOwnerByApartmentId(apartment_id);
  return successResponse(c, owners, 200);
}

export async function getUserById(c: Context) {
  const userId = Number(c.req.param('id'));
  const user = await ownerService.getUserById(userId);
  return successResponse(c, user, 200);
}
