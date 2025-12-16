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
          const add = await tx.addresses.create({
            data: {
              address_line: data.address.address_line ?? null,
              province: data.address.province ?? null,
              district: data.address.district ?? null,
              subdistrict: data.address.subdistrict ?? null,
              postal_code: data.address.postal_code ?? null,
            },
          });
          addressId = add.id;
        }
      }

      const organizationId = data.organization_id ?? data.host_user_id;

      if (!organizationId) {
        throw new Error('host_user_id or organization_id is required');
      }

      const existingOrg = await tx.event_organization.findUnique({
        where: { id: organizationId },
      });

      if (!existingOrg) {
        await tx.event_organization.create({
          data: {
            id: organizationId,
            name: data.organization?.name ?? null,
            email: data.organization?.email ?? null,
            phone_number: data.organization?.phone_number ?? null,
          },
        });
      } else if (data.organization) {
        await tx.event_organization.update({
          where: { id: organizationId },
          data: {
            name: data.organization.name ?? existingOrg.name,
            email: data.organization.email ?? existingOrg.email,
            phone_number:
              data.organization.phone_number ?? existingOrg.phone_number,
          },
        });
      }

      const event = await tx.events.create({
        data: {
          title: data.title,
          description: data.description ?? null,
          total_seats: data.total_seats ?? 0,
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
      if (data.host_user_id !== undefined)
        updateData.host_user_id = data.host_user_id;

      if (data.start_date) {
        updateData.start_at = new Date(
          `${data.start_date}T${data.start_time ?? '00:00'}`
        );
      }
      if (data.end_date) {
        updateData.end_at = new Date(
          `${data.end_date}T${data.end_time ?? '00:00'}`
        );
      }

      if (data.organization_id !== undefined)
        updateData.organization_id = data.organization_id;
      if (data.address_id !== undefined)
        updateData.address_id = data.address_id;

      const event = await tx.events.update({
        where: { id },
        data: updateData,
      });

      if (data.event_tag_name !== undefined) {
        await tx.event_tag.deleteMany({ where: { event_id: id } });

        if (data.event_tag_name) {
          const uid = data.host_user_id || event.host_user_id;

          if (!uid) throw new Error('host_user_id required for event tag');

          const tag = await tx.event_tag_name.upsert({
            where: { id: uid },
            create: { id: uid, name: data.event_tag_name },
            update: { name: data.event_tag_name },
          });

          await tx.event_tag.create({
            data: {
              event_id: id,
              event_tag_id: tag.id,
              name: data.event_tag_name,
            },
          });
        }
      }

      return event;
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

const countByDay = async (from: string, to: string) => {
  try {
    const rows = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE(start_at) AS date,
             COUNT(*)::bigint AS count
      FROM events
      WHERE start_at BETWEEN ${new Date(from)} AND ${new Date(to)}
      GROUP BY DATE(start_at)
      ORDER BY date
    `;

    return rows.map((x) => ({ date: x.date, count: Number(x.count) }));
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
  countByDay,
};
