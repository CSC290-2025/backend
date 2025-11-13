import { room_status } from '@/generated/prisma';
import { z } from 'zod';
import { ApartmentSchemas } from './apartment.schema';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const RoomSchema = z.object({
  id: z.int(),
  name: z.string().min(2).max(255).nullable(),
  type: z.string().min(2).max(255).nullable(),
  size: z.string().min(1).nullable(),
  room_status: z
    .enum(['occupied', 'pending', 'available'])
    .default('available')
    .nullable(),
  price_start: z.number().min(0).nullable(),
  price_end: z.number().min(0).nullable(),
  apartment_id: z.int().nullable(),
});
const RoomListSchema = z.array(RoomSchema);
const RoomStatus = room_status;
const createRoomSchema = z
  .object({
    name: z.string().min(2).max(255),
    type: z.string().min(2).max(255),
    size: z.string().min(1).default('0'),
    price_start: z.number().min(0).default(0),
    price_end: z.number().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    // For creation both price_start and price_end are required, so we can
    // safely validate the relationship here.
    if (data.price_start >= data.price_end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'price_start must be less than price_end',
        path: ['price_start'],
      });
    }
  });

const updateRoomSchema = z
  .object({
    name: z.string().min(2).max(255).optional(),
    type: z.string().min(2).max(255).optional(),
    size: z.string().min(1).optional(),
    price_start: z.number().min(0).optional(),
    price_end: z.number().min(0).optional(),
    room_status: z
      .enum(['occupied', 'pending', 'available'])
      .default('available')
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Only validate price relationship if both values are provided
    if (
      data.price_start !== undefined &&
      data.price_end !== undefined &&
      data.price_start >= data.price_end
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'price_start must be less than price_end',
        path: ['price_start'],
      });
    }
  });
const RoomIdParam = z.object({
  roomId: z.coerce.number().int().positive(),
});
const RoomParam = z.object({
  id: z.coerce.number().int().positive(),
  roomId: z.coerce.number().int().positive(),
});

//openAPI
const getAllRoomsRoute = createGetRoute({
  path: '/apartments/{id}/rooms',
  summary: 'Get all rooms for an apartment',
  params: ApartmentSchemas.ApartmentIdParam,
  responseSchema: RoomListSchema,
  tags: ['Room'],
});
const getRoomsByStatusRoute = createGetRoute({
  path: '/apartments/{id}/rooms/{status}',
  summary: 'Get all rooms for an apartment by status',
  params: ApartmentSchemas.ApartmentIdParam.extend({
    status: z.enum(['occupied', 'pending', 'available']),
  }),
  responseSchema: RoomListSchema,
  tags: ['Room'],
});
const getRoomByIDRoute = createGetRoute({
  path: '/apartments/{id}/rooms/{roomId}',
  summary: 'Get a room by ID',
  params: z.object({
    id: z.coerce.number().int().positive(),
    roomId: z.coerce.number().int().positive(),
  }),
  responseSchema: RoomSchema,
  tags: ['Room'],
});
const createRoomRoute = createPostRoute({
  path: '/apartments/{id}/rooms',
  summary: 'Create a new room for an apartment',
  requestSchema: createRoomSchema,
  responseSchema: RoomSchema,
  params: ApartmentSchemas.ApartmentIdParam,
  tags: ['Room'],
});

const updateRoomRoute = createPutRoute({
  path: '/apartments/{id}/rooms/{roomId}',
  summary: 'Update an existing room',
  requestSchema: updateRoomSchema,
  responseSchema: RoomSchema,
  params: RoomParam,
  tags: ['Room'],
});
const deleteRoomRoute = createDeleteRoute({
  path: '/apartments/{id}/rooms/{roomId}',
  summary: 'Delete a room',
  params: RoomParam,
  tags: ['Room'],
});
export const RoomSchemas = {
  RoomSchema,
  RoomListSchema,
  createRoomSchema,
  updateRoomSchema,
  RoomIdParam,
  RoomStatus,
  getAllRoomsRoute,
  getRoomsByStatusRoute,
  getRoomByIDRoute,
  createRoomRoute,
  updateRoomRoute,
  deleteRoomRoute,
};
