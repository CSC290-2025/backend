import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { createRoomData } from '../schemas';

export async function getAllRooms(apartmentId: number) {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        apartment: { id: apartmentId },
      },
    });
    return rooms;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function getRoomByID(id: string) {
  try {
    const room = await prisma.room.findUnique({
      where: { id },
    });
    return room;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function getRoomByStatus(apartmentId: number, status: string) {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        apartment: { id: apartmentId },
        room_status: status || 'available',
      },
    });
    return rooms;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function createRoom(data: createRoomData, apartmentId: number) {
  try {
    const room = await prisma.room.create({
      data: {
        ...data,
        apartment: { connect: { id: apartmentId } },
        status: 'available',
      },
    });
    return room;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function updateRoom(id: string, data: Partial<createRoomData>) {
  try {
    const room = await prisma.room.update({
      where: { id },
      data,
    });
    return room;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function deleteRoom(id: string) {
  try {
    await prisma.room.delete({
      where: { id },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}
