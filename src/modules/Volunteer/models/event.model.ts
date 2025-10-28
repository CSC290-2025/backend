import prisma from '../../../config/client';
import { handlePrismaError } from '../../../errors';
import type { CreateEventInput, UpdateEventInput } from '../types';

const findMany = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      prisma.volunteer_events.findMany({
        take: limit,
        skip: skip,
        orderBy: {
          start_at: { sort: 'desc', nulls: 'last' },
        },
        select: {
          id: true,
          title: true,
          description: true,
          image_url: true,
          current_participants: true,
          total_seats: true,
          start_at: true,
          end_at: true,
          registration_deadline: true,
          status: true,
          created_at: true,
          updated_at: true,
          created_by_user_id: true,
          department_id: true,
          address_id: true,
        },
      }),
      prisma.volunteer_events.count(),
    ]);
    return { events, total, page, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    handlePrismaError(error);
  }
};

const findById = async (id: number) => {
  try {
    return await prisma.volunteer_events.findUnique({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateEventInput) => {
  try {
    return await prisma.volunteer_events.create({
      data: {
        title: data.title,
        description: data.description,
        start_at: new Date(data.start_at),
        end_at: new Date(data.end_at),
        total_seats: data.total_seats,
        created_by_user_id: data.created_by_user_id,
        image_url: data.image_url,
        department_id: data.department_id,
        registration_deadline: data.registration_deadline
          ? new Date(data.registration_deadline)
          : undefined,
        address_id: data.address_id,
        //status: data.status,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (id: number, data: UpdateEventInput) => {
  try {
    return await prisma.volunteer_events.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        start_at: data.start_at ? new Date(data.start_at) : undefined,
        end_at: data.end_at ? new Date(data.end_at) : undefined,
        total_seats: data.total_seats,
        image_url: data.image_url,
        department_id: data.department_id,
        registration_deadline: data.registration_deadline
          ? new Date(data.registration_deadline)
          : data.registration_deadline === null
            ? null
            : undefined,
        address_id: data.address_id,
        //status: data.status,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const remove = async (id: number) => {
  try {
    await prisma.volunteer_events.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findMany, findById, create, update, remove };
