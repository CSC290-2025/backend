import { successResponse } from '@/utils/response';
import { apartmentService } from '../service/index.ts';
import type { Context } from 'hono';

export async function getAllApartment(c: Context) {
  const apartments = await apartmentService.getAllApartments();
  return successResponse(c, { apartments });
}

export async function getApartmentByID(c: Context) {
  const id = Number(c.req.param('id'));
  const apartment = await apartmentService.getApartmentByID(id);
  return successResponse(c, { apartment });
}
export async function createApartment(c: Context) {
  const data = await c.req.json();
  const apartment = await apartmentService.createApartment(data);
  return successResponse(
    c,
    { apartment },
    201,
    'Apartment created successfully'
  );
}

export async function updateApartment(c: Context) {
  const id = Number(c.req.param('id'));
  const data = await c.req.json();
  const apartment = await apartmentService.updateApartment(data, id);
  return successResponse(
    c,
    { apartment },
    200,
    'Apartment updated successfully'
  );
}
export async function deleteApartment(c: Context) {
  const id = Number(c.req.param('id'));
  await apartmentService.deleteApartment(id);
  return successResponse(c, { message: 'Apartment deleted successfully' }, 200);
}
export async function filterApartments(c: Context) {
  const { location, minPrice, maxPrice, search } = c.req.query();
  const apartments = await apartmentService.filterApartments(
    location || null,
    minPrice ? Number(minPrice) : null,
    maxPrice ? Number(maxPrice) : null,
    search || null
  );
  return successResponse(c, { apartments }, 200);
}
export async function countAvailableRooms(c: Context) {
  const id = Number(c.req.param('id'));
  const count = await apartmentService.countAvailableRooms(id);
  return successResponse(c, { count }, 200);
}
