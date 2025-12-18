import type { Context } from 'hono';
import prisma from '@/config/client';
import { successResponse, errorResponse } from '@/utils/response';
import { NotFoundError } from '@/errors'; // Assuming this exists or using generic error
// If specific errors are not exported, we can just use c.json(..., 500) or errorResponse

export const getAllStaff = async (c: Context) => {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const formattedStaff = staff.map((s) => ({
      id: s.id,
      role: s.role,
      facilityId: s.facility_id,
      user: s.users
        ? {
            id: s.users.id,
            email: s.users.email,
            username: s.users.username,
          }
        : undefined,
      createdAt: s.created_at,
    }));

    // successResponse(c, data, statusCode?, message?)
    return successResponse(c, {
      data: formattedStaff,
      total: staff.length,
    });
  } catch (error) {
    return errorResponse(c, String(error), 500);
  }
};

export const updateStaff = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();

    // Check existence first if desired, or rely on Prisma error
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(c, 'Staff member not found', 404);
    }

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: {
        role: body.role,
        facility_id: body.facilityId,
      },
      include: { users: true },
    });

    return successResponse(
      c,
      {
        id: updatedStaff.id,
        role: updatedStaff.role,
        facilityId: updatedStaff.facility_id,
        createdAt: updatedStaff.created_at,
      },
      200,
      'Staff updated successfully'
    );
  } catch (error) {
    return errorResponse(c, String(error), 500);
  }
};

export const deleteStaff = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));

    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(c, 'Staff member not found', 404);
    }

    await prisma.staff.delete({
      where: { id },
    });

    // OpenAPI spec for delete says data is null
    return successResponse(c, null, 200, 'Staff access removed successfully');
  } catch (error) {
    return errorResponse(c, String(error), 500);
  }
};
