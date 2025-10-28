import { EventModel } from '../models';
import type {
  CreateEventInput,
  UpdateEventInput,
  PaginationOptions,
  PaginatedEvents,
} from '../types';
import { NotFoundError, ValidationError } from '../../../errors';

const getAll = async (
  pagination: PaginationOptions
): Promise<PaginatedEvents> => {
  const { page, limit } = pagination;
  return await EventModel.findMany(page, limit);
};

const getById = async (id: number) => {
  const event = await EventModel.findById(id);
  if (!event) {
    throw new NotFoundError('Event not found');
  }
  return event;
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

export { getAll, getById, create, update, remove };
