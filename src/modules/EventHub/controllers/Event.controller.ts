import type { Context } from 'hono';
import { EventService } from '../services/';
import { successResponse } from '@/utils/response';

export const listEvents = async (c: Context) => {
  const page = Number(c.req.query('page') || 1);
  const limit = Number(c.req.query('limit') || 10);

  const data = await EventService.listEvents(page, limit);

  return successResponse(c, {
    items: data.items,
    total: data.total,
    page,
    limit,
  });
};

export const getEvent = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const event = await EventService.getEventById(id);

  return successResponse(c, { event });
};

export const createEvent = async (c: Context) => {
  const body = await c.req.json();

  const event = await EventService.createEvent(body);

  return successResponse(c, { event }, 201, 'Event created successfully');
};

export const updateEvent = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();

  const event = await EventService.updateEvent(id, body);

  return successResponse(c, { event }, 200, 'Event updated successfully');
};

export const deleteEvent = async (c: Context) => {
  const id = Number(c.req.param('id'));

  await EventService.deleteEvent(id);

  return successResponse(
    c,
    { success: true },
    200,
    'Event deleted successfully'
  );
};
export const getEventByDay = async (c: Context) => {
  const dateParam = c.req.query('date');

  if (!dateParam) {
    throw new Error('Date parameter is required');
  }

  const from = new Date(dateParam);

  const to = new Date(from);
  to.setDate(to.getDate() + 1);

  const data = await EventService.getEventByDay(from, to);

  return successResponse(c, { data: data });
};
export const listPastBookmarkedEvents = async (c: Context) => {
  const page = Number(c.req.query('page') || 1);
  const limit = Number(c.req.query('limit') || 10);

  const user = c.get('user') as { id: number };
  const userId = user.id;

  const result = await EventService.listPastBookmarkedEvents(
    userId,
    page,
    limit
  );

  return successResponse(c, result);
};
