import type { Context } from 'hono';
import { EventService } from '../services';
import { successResponse } from '../../../utils/response';
import { EventIdParam, PaginationSchema } from '../schemas';

const getAllEvents = async (c: Context) => {
  const query = PaginationSchema.parse(c.req.query());
  const result = await EventService.getAll(query);
  return successResponse(c, result);
};

const getEventById = async (c: Context) => {
  const params = EventIdParam.parse(c.req.param());
  const event = await EventService.getById(params.id);
  return successResponse(c, { event });
};

const createEvent = async (c: Context) => {
  const body = await c.req.json();
  const newEvent = await EventService.create(body);
  return successResponse(
    c,
    { event: newEvent },
    201,
    'Event created successfully'
  );
};

const updateEvent = async (c: Context) => {
  const params = EventIdParam.parse(c.req.param());
  const body = await c.req.json();
  const updatedEvent = await EventService.update(params.id, body);
  return successResponse(
    c,
    { event: updatedEvent },
    200,
    'Event updated successfully'
  );
};

const deleteEvent = async (c: Context) => {
  const params = EventIdParam.parse(c.req.param());
  await EventService.remove(params.id);
  return successResponse(c, null, 200, 'Event deleted successfully');
};

export { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
