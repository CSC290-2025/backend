import { successResponse } from '@/utils/response';
import { EventService } from '../services';
import type { Context } from 'hono';

const listEvents = async (c: Context) => {
  const page = Number(c.req.query('page') || '1');
  const limit = Number(c.req.query('limit') || '10');
  const tag = c.req.query('tag');
  const organization_id = c.req.query('organization_id')
    ? Number(c.req.query('organization_id'))
    : undefined;
  const start_date = c.req.query('start_date');
  const search = c.req.query('search');
  const userId = c.get('userId'); // From auth middleware (optional)

  const result = await EventService.listEvents(
    page,
    limit,
    { tag, organization_id, start_date, search },
    userId
  );

  return successResponse(c, result);
};

const getEvent = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const userId = c.get('userId'); // From auth middleware (optional)

  const event = await EventService.getEventById(id, userId);
  return successResponse(c, { event });
};

const createEvent = async (c: Context) => {
  const body = await c.req.json();
  const hostUserId = c.get('userId'); // From auth middleware

  const event = await EventService.createEvent(body, hostUserId);
  return successResponse(c, { event }, 201, 'Event created successfully');
};

const updateEvent = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const userId = c.get('userId'); // From auth middleware

  const event = await EventService.updateEvent(id, body, userId);
  return successResponse(c, { event }, 200, 'Event updated successfully');
};

const deleteEvent = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const userId = c.get('userId'); // From auth middleware

  await EventService.deleteEvent(id, userId);
  return successResponse(c, null, 200, 'Event deleted successfully');
};

const getDayEventCount = async (c: Context) => {
  const start_date = c.req.query('start_date') || '';
  const end_date = c.req.query('end_date') || '';

  const counts = await EventService.getDayEventCount(start_date, end_date);
  return successResponse(c, { counts });
};

export {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getDayEventCount,
};
