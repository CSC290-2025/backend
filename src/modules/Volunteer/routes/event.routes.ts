import { Hono } from 'hono';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller';

const eventRoutes = new Hono();

eventRoutes.get('/', getAllEvents);
eventRoutes.post('/create', createEvent);
eventRoutes.get('/:id', getEventById);
eventRoutes.put('/:id', updateEvent);
eventRoutes.delete('/:id', deleteEvent);

export default eventRoutes;
