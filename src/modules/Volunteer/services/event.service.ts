import { EventModel } from '../models';
import type {
  CreateEventInput,
  UpdateEventInput,
  PaginationOptions,
  PaginatedEvents,
} from '../types';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from '../../../errors';

const getAll = async (
  query: PaginationOptions & { search?: string; department_id?: number }
): Promise<PaginatedEvents> => {
  const { page, limit, search, department_id } = query;

  return await EventModel.findMany(page, limit, {
    page,
    limit,
    search,
    department_id,
  });
};

const getById = async (id: number, userId?: number) => {
  // userId must be optional
  // 1. Fetch the event details using your model
  const event = await EventModel.findById(id);

  if (!event) {
    // If the event ID (e.g., 61) is not found in the DB, this error is thrown.
    throw new NotFoundError('Event not found');
  }

  // 2. Initialize participation status
  let is_joined = false;

  // 3. Check participation ONLY if a userId was provided
  if (userId) {
    const existingParticipation = await EventModel.findParticipation(
      id,
      userId
    );
    is_joined = !!existingParticipation;
  }

  // 4. Return the combined result
  return { event, is_joined }; // Controller expects this shape
};
const getMyEvents = async (userId: number) => {
  return await EventModel.findEventsByUserId(userId);
};

const create = async (data: CreateEventInput) => {
  if (new Date(data.start_at) < new Date()) {
    throw new ValidationError('Start date cannot be in the past');
  }
  return await EventModel.create(data);
};

const update = async (id: number, data: UpdateEventInput) => {
  await getById(id);

  try {
    return await EventModel.update(id, data);
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Event not found during update');
    }
    throw error;
  }
};

const remove = async (id: number) => {
  await getById(id);

  try {
    await EventModel.remove(id);
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Event not found during delete');
    }
    throw error;
  }
};

const joinEvent = async (eventId: number, userId: number) => {
  await getById(eventId);

  const existingParticipation = await EventModel.findParticipation(
    eventId,
    userId
  );

  if (existingParticipation) {
    throw new ValidationError('You have already joined this event.');
  }

  try {
    const updatedEvent = await EventModel.performJoinTransaction(
      eventId,
      userId
    );
    return updatedEvent;
  } catch (error) {
    if ((error as any).code === 'P2002') {
      throw new ValidationError('You have already joined this event.');
    }
    throw error;
  }
};

const leaveEvent = async (eventId: number, userId: number) => {
  await getById(eventId);

  const result = await EventModel.leave(eventId, userId);

  return result;
};

const getParticipants = async (eventId: number, requesterId: number) => {
  const event = await getById(eventId);

  if (event.created_by_user_id !== requesterId) {
    throw new ForbiddenError(
      'You do not have permission to view participants.'
    );
  }

  return await EventModel.findParticipantsByEventId(eventId);
};

export {
  getAll,
  getById,
  create,
  update,
  remove,
  joinEvent,
  leaveEvent,
  getParticipants,
  getMyEvents,
};
