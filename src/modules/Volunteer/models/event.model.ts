import prisma from '../../../config/client';
import { handlePrismaError } from '../../../errors';
import type {
  CreateEventInput,
  UpdateEventInput,
  PaginationOptions,
} from '../types';
import type { Prisma } from '../../../generated/prisma';
import { NotFoundError } from '../../../errors';

interface EventFilterOptions extends PaginationOptions {
  search?: string;
  department_id?: number;
  tag?: string;
}

const findMany = async (
  page: number,
  limit: number,
  filters: EventFilterOptions
) => {
  try {
    const skip = (page - 1) * limit;

    const where: Prisma.volunteer_eventsWhereInput = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (typeof filters.tag === 'string') {
      where.tag = {
        equals: filters.tag,
      };
    }
    if (filters.department_id) {
      where.department_id = filters.department_id;
    }

    const [events, total] = await Promise.all([
      prisma.volunteer_events.findMany({
        take: limit,
        skip: skip,
        where: where,
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
          //status: true,
          created_at: true,
          updated_at: true,
          created_by_user_id: true,
          department_id: true,
          tag: true,
          address_id: true,
        },
      }),
      prisma.volunteer_events.count({
        where: where,
      }),
    ]);
    return { events, total, page, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error('!!! ORIGINAL PRISMA ERROR in findMany:', error);
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
        //department_id: data.department_id, not done
        registration_deadline: data.registration_deadline
          ? new Date(data.registration_deadline)
          : undefined,
        //address_id: data.address_id,
        //status: data.status,
        tag: data.tag,
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
        //department_id: data.department_id, not done
        registration_deadline: data.registration_deadline
          ? new Date(data.registration_deadline)
          : data.registration_deadline === null
            ? null
            : undefined,
        tag: data?.tag,
        //address_id: data.address_id,
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

const performJoinTransaction = async (eventId: number, userId: number) => {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.volunteer_event_participation.create({
        data: {
          volunteer_event_id: eventId,
          user_id: userId,
        },
      });

      const updatedEvent = await tx.volunteer_events.update({
        where: { id: eventId },
        data: {
          current_participants: {
            increment: 1,
          },
        },
      });

      return updatedEvent;
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const leave = async (eventId: number, userId: number) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const deletedRecord = await tx.volunteer_event_participation.deleteMany({
        where: {
          volunteer_event_id: eventId,
          user_id: userId,
        },
      });

      if (deletedRecord.count === 0) {
        throw new NotFoundError('User was not registered for this event.');
      }

      return await tx.volunteer_events.update({
        where: { id: eventId },
        data: {
          current_participants: {
            decrement: 1,
          },
        },
      });
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    handlePrismaError(error);
  }
};

const findParticipantsByEventId = async (eventId: number) => {
  try {
    const users = await prisma.users.findMany({
      where: {
        volunteer_event_participation: {
          some: {
            volunteer_event_id: eventId,
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    return users;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findParticipation = async (eventId: number, userId: number) => {
  try {
    const events = await prisma.volunteer_event_participation.findFirst({
      where: {
        volunteer_event_id: eventId,
        user_id: userId,
      },
    });

    return events;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findEventsByUserId = async (userId: number) => {
  try {
    const events = await prisma.volunteer_events.findMany({
      where: {
        volunteer_event_participation: {
          some: {
            user_id: userId,
          },
        },
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
        //status: true,
        created_at: true,
        updated_at: true,
        created_by_user_id: true,
        department_id: true,
        address_id: true,
      },
      orderBy: {
        start_at: 'asc',
      },
    });

    return events;
  } catch (error) {
    console.log(error, ' THIS is erorr');

    handlePrismaError(error);
  }
};

export {
  findMany,
  findById,
  create,
  update,
  remove,
  performJoinTransaction,
  leave,
  findParticipantsByEventId,
  findParticipation,
  findEventsByUserId,
};
