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

    // Increase timeout to 10s just in case, but optimize logic
    return await prisma.$transaction(
      async (tx) => {
        // 1. Run Address and Organization logic in parallel
        const [addressId, organizationId] = await Promise.all([
          // Logic for Address
          (async () => {
            if (data.address_id) return data.address_id;
            if (!data.address) return null;

            const addressFields = {
              address_line: data.address.address_line ?? null,
              province: data.address.province ?? null,
              district: data.address.district ?? null,
              subdistrict: data.address.subdistrict ?? null,
              postal_code: data.address.postal_code ?? null,
            };
            const found = await tx.addresses.findFirst({
              where: addressFields,
            });
            return found
              ? found.id
              : (await tx.addresses.create({ data: addressFields })).id;
          })(),

          // Logic for Organization
          (async () => {
            if (data.organization_id) return data.organization_id;
            if (!data.organization) return null;

            const orgFields = {
              name: data.organization.name,
              email: data.organization.email,
              phone_number: data.organization.phone_number,
            };
            const foundOrg = await tx.event_organization.findFirst({
              where: orgFields,
            });
            return foundOrg
              ? foundOrg.id
              : (await tx.event_organization.create({ data: orgFields })).id;
          })(),
        ]);

        if (!organizationId) {
          throw new Error('organization or organization_id is required');
        }

        // 2. Create Event
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

        // 3. Handle Tags (Optimized using upsert if applicable, or keep as is)
        if (data.event_tag_name) {
          // Using upsert is faster and safer than findUnique + create/update
          const tagRecord = await tx.event_tag_name.upsert({
            where: { id: data.host_user_id }, // Ensure this ID logic is correct for your schema
            update: { name: data.event_tag_name },
            create: {
              // If the ID is not auto-generated, you might need to provide it here
              // id: data.host_user_id,
              name: data.event_tag_name,
              users: { connect: { id: data.host_user_id } },
            },
          });

          await tx.event_tag.create({
            data: {
              event_id: event.id,
              event_tag_id: tagRecord.id,
              name: data.event_tag_name,
            },
          });
        }

        return event;
      },
      { timeout: 10000 }
    ); // Still good to keep a slightly higher timeout
  } catch (err) {
    console.error('PRISMA CREATE ERROR:', err);
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
      if (data.image_url !== undefined) updateData.image_url = data.image_url;
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
const listWasteEvents = async () => {
  try {
    return await prisma.events.findMany({
      where: {
        event_tag: {
          name: {
            equals: 'waste',
            mode: 'insensitive',
          },
        },
      },
      include: {
        event_organization: true,
        addresses: true,
        event_tag: {
          include: {
            event_tag_name: true,
          },
        },
      },
      orderBy: {
        start_at: 'desc',
      },
    });
  } catch (err) {
    handlePrismaError(err);
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
  listWasteEvents,
};
