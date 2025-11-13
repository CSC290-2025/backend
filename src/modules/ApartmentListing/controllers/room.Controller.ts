import { roomService } from '../service';
import { successResponse } from '@/utils/response';
import type { Context } from 'hono';

export async function getAllRoom(c: Context) {
  const apartmentId = Number(c.req.param('id'));
  const rooms = await roomService.getAllRooms(apartmentId);
  return successResponse(c, rooms);
}
export async function getRoomByID(c: Context) {
  const roomId = Number(c.req.param('roomId'));
  const room = await roomService.getRoomByID(roomId);
  return successResponse(c, room);
}
export async function getRoomByStatus(c: Context) {
  const apartmentId = Number(c.req.param('id'));
  const status = c.req.param('status') || 'available';
  const rooms = await roomService.getRoomByStatus(apartmentId, status);
  return successResponse(c, rooms);
}

export async function createRoom(c: Context) {
  const apartmentId = Number(c.req.param('id'));
  const data = await c.req.json();
  const room = await roomService.createRoom(data, apartmentId);
  return successResponse(c, room);
}
export async function updateRoom(c: Context) {
  const roomId = Number(c.req.param('roomId'));
  const data = await c.req.json();
  const room = await roomService.updateRoom(data, roomId);
  return successResponse(c, room);
}
export async function deleteRoom(c: Context) {
  const roomId = Number(c.req.param('roomId'));
  await roomService.deleteRoom(roomId);
  return successResponse(c, { message: 'Room deleted successfully' });
}
