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
  getMyEvents,
} from '../controllers/event.controller';
import { authMiddleware } from '@/middlewares';

const eventRoutes = new Hono();

eventRoutes.get('/getAll', getAllEvents);
eventRoutes.post('/create', createEvent);
eventRoutes.get('/my-events', getMyEvents);

eventRoutes.post('/:id/join', joinEvent);
eventRoutes.delete('/:id/join', leaveEvent);
eventRoutes.get('/:id/participants', authMiddleware, getEventParticipants);
eventRoutes.put('/:id/update', updateEvent);

eventRoutes.get('/:id', authMiddleware, getEventById);
eventRoutes.delete('/:id', deleteEvent);

export default eventRoutes;
