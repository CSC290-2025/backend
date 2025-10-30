import { Hono } from 'hono';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventParticipants,
} from '../controllers/event.controller';

const eventRoutes = new Hono();

eventRoutes.get('/getAll', getAllEvents);
eventRoutes.post('/create', createEvent);

eventRoutes.post('/:id/join', joinEvent);
eventRoutes.delete('/:id/join', leaveEvent);
eventRoutes.get('/:id/participants', getEventParticipants);

eventRoutes.get('/:id', getEventById);
eventRoutes.put('/:id/update', updateEvent);
eventRoutes.delete('/:id', deleteEvent);

export default eventRoutes;
