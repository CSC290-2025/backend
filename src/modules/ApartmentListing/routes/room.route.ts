import { Hono } from 'hono';
import * as roomController from '../controllers/room.Controller.ts';

const roomRoutes = new Hono();
roomRoutes.get('/:id', roomController.getRoomByID);
roomRoutes.get('/', roomController.getAllRoom); //get all rooms in the apartment
roomRoutes.get('/status', roomController.getRoomByStatus); // fetch only available rooms

//admin
roomRoutes.post('/', roomController.createRoom); //create room in the apartment
roomRoutes.patch('/:id', roomController.updateRoom);
roomRoutes.delete('/:id', roomController.deleteRoom);

export { roomRoutes };
