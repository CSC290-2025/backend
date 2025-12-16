import prisma from '@/config/client';
import { handlePrismaError, NotFoundError } from '@/errors';
import type { CreateEventInput, UpdateEventInput } from '../types';

const findById = async (id: number) => {
  try {
    return await prisma.events.findUnique({
      where: { id },
      include: {
        event_organization: true,
        addresses: true,
        event_tag: {
          include: { event_tag_name: true },
        },
      },
    });
  } catch (err) {
    handlePrismaError(err);
  }
};

const list = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.events.findMany({
        take: limit,
        skip,
        orderBy: { start_at: 'desc' },
        include: {
          event_organization: true,
          addresses: true,
          event_tag: {
            include: { event_tag_name: true },
          },
        },
      }),
      prisma.events.count(),
    ]);

    return { items, total };
  } catch (err) {
    handlePrismaError(err);
  }
};

const create = async (data: CreateEventInput) => {
  try {
    const start_at = new Date(`${data.start_date}T${data.start_time}`);
    const end_at = new Date(`${data.end_date}T${data.end_time}`);

    return await prisma.$transaction(async (tx) => {
      let addressId = data.address_id ?? null;

      if (!addressId && data.address) {
        const found = await tx.addresses.findFirst({
          where: {
            address_line: data.address.address_line ?? null,
            province: data.address.province ?? null,
            district: data.address.district ?? null,
            subdistrict: data.address.subdistrict ?? null,
            postal_code: data.address.postal_code ?? null,
          },
        });

        if (found) {
          addressId = found.id;
        } else {
          const created = await tx.addresses.create({
            data: {
              address_line: data.address.address_line ?? null,
              province: data.address.province ?? null,
              district: data.address.district ?? null,
              subdistrict: data.address.subdistrict ?? null,
              postal_code: data.address.postal_code ?? null,
            },
          });
          addressId = created.id;
        }
      }

      let organizationId = data.organization_id ?? null;

      if (!organizationId && data.organization) {
        const foundOrg = await tx.event_organization.findFirst({
          where: {
            name: data.organization.name,
            email: data.organization.email,
            phone_number: data.organization.phone_number,
          },
        });

        if (foundOrg) {
          organizationId = foundOrg.id;
        } else {
          const createdOrg = await tx.event_organization.create({
            data: {
              name: data.organization.name,
              email: data.organization.email,
              phone_number: data.organization.phone_number,
            },
          });
          organizationId = createdOrg.id;
        }
      }

      if (!organizationId) {
        throw new Error('organization or organization_id is required');
      }

      const event = await tx.events.create({
        data: {
          title: data.title,
          description: data.description ?? null,
          total_seats: data.total_seats ?? 0,
          image_url: data.image_url ?? null,
          start_at,
          end_at,
          host_user_id: data.host_user_id,
          organization_id: organizationId,
          address_id: addressId,
        },
      });

      if (data.event_tag_name) {
        const tag = await tx.event_tag_name.upsert({
          where: { id: data.host_user_id },
          create: { id: data.host_user_id, name: data.event_tag_name },
          update: { name: data.event_tag_name },
        });

        await tx.event_tag.create({
          data: {
            event_id: event.id,
            event_tag_id: tag.id,
            name: data.event_tag_name,
          },
        });
      }

      return event;
    });
  } catch (err) {
    handlePrismaError(err);
  }
};

const update = async (id: number, data: UpdateEventInput) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const updateData: any = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.total_seats !== undefined)
        updateData.total_seats = data.total_seats;
      if (data.image_url !== undefined) updateData.imageurl = data.image_url;
      if (data.start_date && data.start_time) {
        updateData.start_at = new Date(`${data.start_date}T${data.start_time}`);
      }

      if (data.end_date && data.end_time) {
        updateData.end_at = new Date(`${data.end_date}T${data.end_time}`);
      }

      let addressId = data.address_id ?? null;

      if (!addressId && data.address) {
        const found = await tx.addresses.findFirst({
          where: {
            address_line: data.address.address_line ?? null,
            province: data.address.province ?? null,
            district: data.address.district ?? null,
            subdistrict: data.address.subdistrict ?? null,
            postal_code: data.address.postal_code ?? null,
          },
        });

        if (found) {
          addressId = found.id;
        } else {
          const created = await tx.addresses.create({
            data: {
              address_line: data.address.address_line ?? null,
              province: data.address.province ?? null,
              district: data.address.district ?? null,
              subdistrict: data.address.subdistrict ?? null,
              postal_code: data.address.postal_code ?? null,
            },
          });
          addressId = created.id;
        }
      }

      if (addressId !== null) updateData.address_id = addressId;

      let organizationId = data.organization_id ?? null;

      if (!organizationId && data.organization) {
        const foundOrg = await tx.event_organization.findFirst({
          where: {
            name: data.organization.name,
            email: data.organization.email,
            phone_number: data.organization.phone_number,
          },
        });

        if (foundOrg) {
          organizationId = foundOrg.id;
        } else {
          const createdOrg = await tx.event_organization.create({
            data: {
              name: data.organization.name,
              email: data.organization.email,
              phone_number: data.organization.phone_number,
            },
          });
          organizationId = createdOrg.id;
        }
      }

      if (organizationId !== null) {
        updateData.organization_id = organizationId;
      }

      return await tx.events.update({
        where: { id },
        data: updateData,
      });
    });
  } catch (err) {
    handlePrismaError(err);
  }
};

const remove = async (id: number) => {
  try {
    await prisma.events.delete({ where: { id } });
    return true;
  } catch (err) {
    handlePrismaError(err);
  }
};
const getEventByDay = async (from: Date, to: Date) => {
  try {
    return await prisma.events.findMany({
      where: {
        start_at: {
          gte: from,
          lt: to,
        },
      },
      orderBy: {
        start_at: 'asc',
      },
    });
  } catch (err) {
    handlePrismaError(err);
  }
};

const listPastBookmarkedEvents = async (
  userId: number,
  page: number,
  limit: number
) => {
  try {
    const skip = (page - 1) * limit;
    const now = new Date();

    const [items, total] = await Promise.all([
      prisma.events.findMany({
        where: {
          end_at: {
            lt: now,
          },

          event_bookmarks: {
            some: {
              user_id: userId,
            },
          },
        },
        take: limit,
        skip,
        orderBy: {
          end_at: 'desc',
        },
      }),
      prisma.events.count({
        where: {
          end_at: {
            lt: now,
          },
          event_bookmarks: {
            some: {
              user_id: userId,
            },
          },
        },
      }),
    ]);

    return { items, total };
  } catch (err) {
    handlePrismaError(err);
    return { items: [], total: 0 };
  }
};
export const EventModel = {
  findById,
  list,
  create,
  update,
  remove,
  getEventByDay,
  listPastBookmarkedEvents,
};
