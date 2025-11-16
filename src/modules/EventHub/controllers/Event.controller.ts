import type { Context } from 'hono';
import { EventService } from '../services/';

const listEvents = async (c: Context) => {
  const page = Number(c.req.query('page')) || 1;
  const limit = Number(c.req.query('limit')) || 10;
  const data = await EventService.listEvents(page, limit);
  return c.json({ ...data, page, limit }, 200);
};

const getEvent = async (c: Context) => {
  const id = c.req.param('id');
  const event = await EventService.getEventById(Number(id));
  return c.json({ event }, 200);
};

const createEvent = async (c: Context) => {
  const body = await c.req.json();
  const event = await EventService.createEvent(body);
  return c.json({ event }, 201);
};

const updateEvent = async (c: Context) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const event = await EventService.updateEvent(Number(id), body);
  return c.json({ event }, 200);
};

const deleteEvent = async (c: Context) => {
  const id = c.req.param('id');
  await EventService.deleteEvent(Number(id));
  return c.json({ success: true as const }, 200);
};

const getDayEventCount = async (c: Context) => {
  const from = c.req.query('from') || '';
  const to = c.req.query('to') || '';
  const data = await EventService.getDayEventCount(from, to);
  return c.json({ data }, 200);
};

export {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getDayEventCount,
};
