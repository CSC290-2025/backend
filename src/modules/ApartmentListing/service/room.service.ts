import { apartmentModel, roomModel } from '../models';
import { NotFoundError } from '@/errors';
import type { Room, createRoomData, updateRoomData } from '../types';

const getRoomByID = async (id: number): Promise<Room> => {
  const room = await roomModel.getRoomByID(id);
  if (!room) throw new NotFoundError('Room not found');
  return room;
};
const getAllRooms = async (id: number): Promise<Room[]> => {
  const apartmentId = await apartmentModel.getApartmentById(id);
  if (!apartmentId) throw new NotFoundError('Apartment not found');

  const rooms = await roomModel.getAllRooms(apartmentId.id);
  if (!rooms) throw new NotFoundError('No rooms found');
  return rooms;
};

const getRoomByStatus = async (id: number, status: string): Promise<Room[]> => {
  const apartment = await apartmentModel.getApartmentById(id);
  if (!apartment) throw new NotFoundError('Apartment not found');
  const rooms = await roomModel.getRoomByStatus(apartment.id, status);
  if (!rooms) throw new NotFoundError('No rooms found');
  return rooms;
};
const createRoom = async (
  data: createRoomData,
  apartmentId: number
): Promise<Room> => {
  const apartment = await apartmentModel.getApartmentById(apartmentId);
  if (!apartment) throw new NotFoundError('Apartment not found');
  return roomModel.createRoom(data, apartmentId);
};
const updateRoom = async (data: updateRoomData, id: number): Promise<Room> => {
  const existingRoom = await roomModel.getRoomByID(id);
  if (!existingRoom) throw new NotFoundError('Room not found');
  return roomModel.updateRoom(id, data);
};
const deleteRoom = async (id: number): Promise<void> => {
  const existingRoom = await roomModel.getRoomByID(id);
  if (!existingRoom) throw new NotFoundError('Room not found');
  await roomModel.deleteRoom(id);
};
export {
  getRoomByID,
  getAllRooms,
  getRoomByStatus,
  createRoom,
  updateRoom,
  deleteRoom,
};
