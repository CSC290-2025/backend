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

export const getDayEventCount = async (c: Context) => {
  const from = c.req.query('from')!;
  const to = c.req.query('to')!;

  const data = await EventService.getDayEventCount(from, to);

  return successResponse(c, { data });
};
