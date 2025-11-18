import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { CreateEventInput, UpdateEventInput } from '../types';

const findById = async (id: number) => {
  try {
    return await prisma.events.findUnique({
      where: { id },
      include: {
        event_organization: true,
        addresses: true,
        event_tag: {
          include: {
            event_tag_name: true,
          },
        },
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const list = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.events.findMany({
        take: limit,
        skip: skip,
        orderBy: {
          start_at: { sort: 'desc', nulls: 'last' },
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
      }),
      prisma.events.count(),
    ]);

    return { items, total };
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateEventInput) => {
  try {
    const startDateTime = new Date(
      `${data.start_date}T${data.start_time || '00:00:00'}`
    );
    const endDateTime = new Date(
      `${data.end_date}T${data.end_time || '00:00:00'}`
    );

    return await prisma.$transaction(async (tx) => {
      let organizationId = data.organization_id;
      if (data.organization && !organizationId) {
        const org = await tx.event_organization.create({
          data: {
            id: data.host_user_id,
            name: data.organization.name,
            email: data.organization.email,
            phone_number: data.organization.phone_number,
          },
        });
        organizationId = org.id;
      }

      let addressId = data.address_id;
      if (data.address && !addressId) {
        const addr = await tx.addresses.create({
          data: {
            address_line: data.address.address_line,
            province: data.address.province,
            district: data.address.district,
            subdistrict: data.address.subdistrict,
            postal_code: data.address.postal_code,
          },
        });
        addressId = addr.id;
      }
      // 3. Create event
      const event = await tx.events.create({
        data: {
          title: data.title,
          description: data.description,
          total_seats: data.total_seats || 0,
          start_at: startDateTime,
          end_at: endDateTime,
          host_user_id: data.host_user_id,
          organization_id: organizationId,
          address_id: addressId,
        },
      });

      // 4. Create event tag if provided
      if (data.event_tag_name) {
        const tagName = await tx.event_tag_name.upsert({
          where: { id: data.host_user_id },
          create: {
            id: data.host_user_id,
            name: data.event_tag_name,
          },
          update: {
            name: data.event_tag_name,
          },
        });

        // Link event to tag
        await tx.event_tag.create({
          data: {
            event_id: event.id,
            event_tag_id: tagName.id,
            name: data.event_tag_name,
          },
        });
      }

      return event;
    });
  } catch (error) {
    console.error('Create event error:', error);
    handlePrismaError(error);
  }
};

const update = async (id: number, data: UpdateEventInput) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const updateData: any = {};

      if (data.title !== undefined) {
        updateData.title = data.title;
      }
      if (data.description !== undefined) {
        updateData.description = data.description;
      }
      if (data.total_seats !== undefined) {
        updateData.total_seats = data.total_seats;
      }
      if (data.host_user_id !== undefined) {
        updateData.host_user_id = data.host_user_id;
      }

      // Handle date/time combinations
      if (data.start_date && data.start_time) {
        updateData.start_at = new Date(`${data.start_date}T${data.start_time}`);
      } else if (data.start_date) {
        updateData.start_at = new Date(`${data.start_date}T00:00:00`);
      }

      if (data.end_date && data.end_time) {
        updateData.end_at = new Date(`${data.end_date}T${data.end_time}`);
      } else if (data.end_date) {
        updateData.end_at = new Date(`${data.end_date}T00:00:00`);
      }

      // Update organization if provided
      if (data.organization_id !== undefined) {
        updateData.organization_id = data.organization_id;
      }
      if (data.address_id !== undefined) {
        updateData.address_id = data.address_id;
      }

      // Update event
      const event = await tx.events.update({
        where: { id },
        data: updateData,
      });

      // Update event tag if provided
      if (data.event_tag_name !== undefined) {
        // Delete existing tag relationship
        await tx.event_tag.deleteMany({
          where: { event_id: id },
        });

        // Only create new tag if name is not empty
        if (data.event_tag_name) {
          const userId = data.host_user_id || event.host_user_id;

          // Ensure userId exists
          if (!userId) {
            throw new Error('host_user_id is required for event tag');
          }

          // Check if this user already has a tag name
          let tagName = await tx.event_tag_name.findUnique({
            where: { id: userId },
          });

          // Create or update the tag name for this user
          if (!tagName) {
            tagName = await tx.event_tag_name.create({
              data: {
                id: userId,
                name: data.event_tag_name,
              },
            });
          } else {
            // Update the existing tag name
            tagName = await tx.event_tag_name.update({
              where: { id: userId },
              data: {
                name: data.event_tag_name,
              },
            });
          }

          // Link event to tag (with redundant name field)
          await tx.event_tag.create({
            data: {
              event_id: event.id,
              event_tag_id: tagName.id,
              name: data.event_tag_name, // Storing name here as well per your schema
            },
          });
        }
      }

      return event;
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const remove = async (id: number) => {
  try {
    await prisma.events.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    handlePrismaError(error);
  }
};

const countByDay = async (from: string, to: string) => {
  try {
    const counts = await prisma.$queryRaw<
      Array<{ date: string; count: bigint }>
    >`
        SELECT
          DATE(start_at) as date,
          COUNT(*)::bigint as count
        FROM events
        WHERE start_at BETWEEN ${new Date(from)} AND ${new Date(to)}
        GROUP BY DATE(start_at)
        ORDER BY date
      `;

    return counts.map((c) => ({
      date: c.date,
      count: Number(c.count),
    }));
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findById, list, create, update, remove, countByDay };
