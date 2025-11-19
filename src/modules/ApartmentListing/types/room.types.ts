import type { z } from 'zod';
import type { RoomSchemas } from '../schemas';

type Room = z.infer<typeof RoomSchemas.RoomSchema>;
type RoomList = z.infer<typeof RoomSchemas.RoomListSchema>;
type createRoomData = z.infer<typeof RoomSchemas.createRoomSchema>;
type updateRoomData = z.infer<typeof RoomSchemas.updateRoomSchema>;
type RoomIdParam = z.infer<typeof RoomSchemas.RoomIdParam>;
type RoomStatus = z.infer<typeof RoomSchemas.RoomStatus>;

export type {
  Room,
  RoomList,
  createRoomData,
  updateRoomData,
  RoomIdParam,
  RoomStatus,
};
