import { roomService } from '../service/index.ts';
import { successResponse } from '@/utils/response';
import type { Context } from 'hono';

export async function getAllRoom(c: Context) {
  const apartmentId = Number(c.req.query('apartmentId'));
  const rooms = await roomService.getAllRooms(apartmentId);
  return successResponse(c, { rooms });
}
export async function getRoomByID(c: Context) {
  const id = Number(c.req.param('id'));
  const room = await roomService.getRoomByID(id);
  return successResponse(c, { room });
}
export async function getRoomByStatus(c: Context) {
  const apartmentId = Number(c.req.query('apartmentId'));
  const status = c.req.query('status') || 'available';
  const rooms = await roomService.getRoomByStatus(apartmentId, status);
  return successResponse(c, { rooms });
}

export async function createRoom(c: Context) {
  const apartmentId = Number(c.req.query('apartmentId'));
  const data = await c.req.json();
  const room = await roomService.createRoom(data, apartmentId);
  return successResponse(c, { room });
}
export async function updateRoom(c: Context) {
  const id = Number(c.req.param('id'));
  const data = await c.req.json();
  const room = await roomService.updateRoom(data, id);
  return successResponse(c, { room });
}
export async function deleteRoom(c: Context) {
  const id = Number(c.req.param('id'));
  await roomService.deleteRoom(id);
  return successResponse(c, { message: 'Room deleted successfully' });
}
