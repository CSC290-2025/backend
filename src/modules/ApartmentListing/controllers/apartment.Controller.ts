import { successResponse } from '@/utils/response';
import * as apartmentModel from '../models/apartment.model.ts';
import type { Context } from 'hono';

export async function getAllApartment(c: Context) {
  const apartments = await apartmentModel.getAllApartments();
  return successResponse(c, { apartments });
}

export async function getApartmentByID(c: Context) {
  const id = c.req.param('id');
  const apartment = await apartmentModel.getApartmentById(id);
  return successResponse(c, { apartment });
}
export async function createApartment(c: Context) {
  const data = await c.req.json();
  const apartment = await apartmentModel.createApartment(data);
  return successResponse(c, { apartment });
}
export async function updateApartment(c: Context) {
  const id = c.req.param('id');
  const data = await c.req.json();
  const apartment = await apartmentModel.updateApartment(data, id);
  return successResponse(c, { apartment });
}
export async function deleteApartment(c: Context) {
  const id = c.req.param('id');
  await apartmentModel.deleteApartment(id);
  return successResponse(c, { message: 'Apartment deleted successfully' });
}
export async function filterApartments(c: Context) {
  const { location, minPrice, maxPrice, search } = c.req.query();
  const apartments = await apartmentModel.filterApartments(
    location,
    minPrice ? Number(minPrice) : undefined,
    maxPrice ? Number(maxPrice) : undefined,
    search
  );
  return successResponse(c, { apartments });
}
export async function countAvailableRooms(c: Context) {
  const id = c.req.param('id');
  const count = await apartmentModel.countAvailableRooms(id);
  return successResponse(c, { count });
}
