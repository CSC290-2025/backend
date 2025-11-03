import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  createRoomData,
  updateRoomData,
  RoomStatus,
} from '../types/room.types';
import { RoomSchemas } from '../schemas';

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
export async function getRoomByID(id: number) {
  try {
    const room = await prisma.room.findUnique({
      where: { id },
    });
    return room;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function getRoomByStatus(apartmentId: number, status: RoomStatus) {
  try {
    const desiredStatusValue =
      RoomSchemas.RoomStatus[status as keyof typeof RoomSchemas.RoomStatus];
    const finalStatus = desiredStatusValue || RoomSchemas.RoomStatus.available;

    const rooms = await prisma.room.findMany({
      where: {
        apartment: { id: apartmentId },
        room_status: finalStatus,
      },
    });
    return rooms;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function createRoom(data: createRoomData, apartmentId: number) {
  try {
    const { size, ...rest } = data as any;
    const room = await prisma.room.create({
      data: {
        ...rest,
        size: size !== undefined && size !== null ? String(size) : null,
        apartment_id: apartmentId,
        room_status: RoomSchemas.RoomStatus.available,
      },
    });
    return room;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function updateRoom(id: number, data: updateRoomData) {
  try {
    const { size, ...rest } = data as any;
    const updateData = {
      ...rest,
      size: size !== undefined && size !== null ? String(size) : undefined,
    };
    const room = await prisma.room.update({
      where: { id },
      data: updateData,
    });
    return room;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function deleteRoom(id: number) {
  try {
    await prisma.room.delete({
      where: { id },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}
