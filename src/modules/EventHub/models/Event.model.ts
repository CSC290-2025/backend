import type { Event, CreateEventInput, UpdateEventInput } from '../types';

const findById = async (id: number): Promise<Event | null> => {
  return null;
};

const list = async (
  page: number,
  limit: number
): Promise<{ items: Event[]; total: number }> => {
  return { items: [], total: 0 };
};
const create = async (data: CreateEventInput): Promise<Event> => {
  const now = new Date();
  const event: Event = {
    id: Math.floor(Math.random() * 1_000_000),
    host_user_id: data.host_user_id ?? null,
    organization_id: data.organization_id ?? null,
    image_url: data.image_url ?? null,
    title: data.title,
    description: data.description ?? null,
    total_seats: data.total_seats ?? 0,
    start_at: new Date(data.start_at),
    end_at: new Date(data.end_at),
    address_id: data.address_id ?? null,
    event_tag_id: data.event_tag_id ?? null,
    created_at: now,
    updated_at: now,
  };
  return event;
};

const update = async (
  id: number,
  data: UpdateEventInput
): Promise<Event | null> => {
  return null;
};

const remove = async (id: number): Promise<boolean> => {
  return true;
};

const countByDay = async (
  from: string,
  to: string
): Promise<Array<{ date: string; count: number }>> => {
  return [];
};

export { findById, list, create, update, remove, countByDay };
