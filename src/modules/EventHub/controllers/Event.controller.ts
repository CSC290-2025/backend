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

  const date = new Date(dateParam);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const data = await EventService.getEventByDay(startOfDay, endOfDay);

  return successResponse(c, { data });
};
