import type { Context } from 'hono';
import { EventService } from '../services';
import { successResponse } from '../../../utils/response';
import { EventIdParam, PaginationSchema } from '../schemas';
import { z } from 'zod';

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

const JoinBodySchema = z.object({
  userId: z.number().int().positive('User ID must be a positive integer'),
});

const GetParticipantsQuerySchema = z.object({
  requesterId: z.coerce
    .number()
    .int()
    .positive('Requester ID must be a positive integer'),
});

const joinEvent = async (c: Context) => {
  try {
    const params = EventIdParam.parse(c.req.param());
    const eventId = params.id;

    const body = await c.req.json();
    const validatedBody = JoinBodySchema.parse(body);
    const userId = validatedBody.userId;

    const updatedEvent = await EventService.joinEvent(eventId, userId);

    return successResponse(
      c,
      { event: updatedEvent },
      200,
      'Successfully joined event!'
    );
  } catch (err: any) {
    throw err;
  }
};

const leaveEvent = async (c: Context) => {
  try {
    const params = EventIdParam.parse(c.req.param());

    const body = await c.req.json();
    const validatedBody = JoinBodySchema.parse(body);
    const userId = validatedBody.userId;

    const updatedEvent = await EventService.leaveEvent(params.id, userId);

    return successResponse(
      c,
      { event: updatedEvent },
      200,
      'Successfully left event.'
    );
  } catch (err: any) {
    throw err;
  }
};

const getEventParticipants = async (c: Context) => {
  try {
    const params = EventIdParam.parse(c.req.param());

    const query = GetParticipantsQuerySchema.parse(c.req.query());

    const participants = await EventService.getParticipants(
      params.id,
      query.requesterId
    );

    return successResponse(c, { count: participants.length, participants });
  } catch (err: any) {
    throw err;
  }
};

export {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventParticipants,
};
