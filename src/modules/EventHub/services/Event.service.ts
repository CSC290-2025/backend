import { EventModel } from '../models';
import type { CreateEventInput, UpdateEventInput } from '../types/';
import { NotFoundError, ValidationError } from '@/errors';

const ensureDatesValid = (start_at?: string, end_at?: string) => {
  if (start_at && end_at) {
    const start = new Date(start_at);
    const end = new Date(end_at);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new ValidationError('Invalid date format');
    }
    if (end < start) {
      throw new ValidationError('end_at must be after start_at');
    }
  }
};

const getEventById = async (id: number) => {
  const event = await EventModel.findById(id);
  if (!event) throw new NotFoundError('Event not found');
  return event;
};

const listEvents = async (page: number, limit: number) => {
  return await EventModel.list(page, limit);
};

const createEvent = async (data: CreateEventInput) => {
  ensureDatesValid(data.start_at, data.end_at);
  if (data.total_seats !== undefined && data.total_seats < 0) {
    throw new ValidationError('total_seats must be >= 0');
  }
  return await EventModel.create(data);
};

const updateEvent = async (id: number, data: UpdateEventInput) => {
  const existing = await EventModel.findById(id);
  if (!existing) throw new NotFoundError('Event not found');
  ensureDatesValid(data.start_at, data.end_at);
  const updated = await EventModel.update(id, data);
  if (!updated) throw new NotFoundError('Event not found');
  return updated;
};

const deleteEvent = async (id: number) => {
  const deleted = await EventModel.remove(id);
  if (!deleted) throw new NotFoundError('Event not found');
  return deleted;
};

const getDayEventCount = async (from: string, to: string) => {
  return await EventModel.countByDay(from, to);
};

export {
  getEventById,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getDayEventCount,
};
