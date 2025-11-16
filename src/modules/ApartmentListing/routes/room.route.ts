import { RoomSchemas } from '../schemas';
import * as roomController from '../controllers/room.Controller';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupRoomRoutes = (app: OpenAPIHono) => {
  app.openapi(RoomSchemas.createRoomRoute, roomController.createRoom);
  app.openapi(RoomSchemas.getAllRoomsRoute, roomController.getAllRoom);
  app.openapi(
    RoomSchemas.getRoomsByStatusRoute,
    roomController.getRoomByStatus
  );
  app.openapi(RoomSchemas.getRoomByIDRoute, roomController.getRoomByID);
  app.openapi(RoomSchemas.updateRoomRoute, roomController.updateRoom);
  app.openapi(RoomSchemas.deleteRoomRoute, roomController.deleteRoom);
};
export { setupRoomRoutes };
