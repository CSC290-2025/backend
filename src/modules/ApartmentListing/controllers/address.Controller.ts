import { successResponse } from '@/utils/response';
import { addressService } from '../service/index';
import type { Context } from 'hono';

export async function getAddressByID(c: Context) {
  const id = Number(c.req.param('id'));
  const address = await addressService.getAddressByID(id);
  return successResponse(c, address);
}

export async function createAddress(c: Context) {
  const data = await c.req.json();
  const address = await addressService.createAddress(data);
  return successResponse(c, address, 201, 'Address created successfully');
}

export async function updateAddress(c: Context) {
  const id = Number(c.req.param('id'));
  const data = await c.req.json();
  const address = await addressService.updateAddress(data, id);
  return successResponse(c, address, 200, 'Address updated successfully');
}

export async function deleteAddress(c: Context) {
  const id = Number(c.req.param('id'));
  await addressService.deleteAddress(id);
  return successResponse(c, { message: 'Address deleted successfully' }, 200);
}
