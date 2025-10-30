import { z } from 'zod';

const createApartmentSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().min(10).max(10),
  description: z.string().min(10),
  apartment_type: z.enum(['dormitory', 'apartment']),
  apartment_location: z.enum(['asoke', 'prachauthit', 'phathumwan']),
  electric_price: z.number().min(0),
  water_price: z.number().min(0),
  internet: z.enum(['free', 'not_free', 'none']),
});

const updateApartmentSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().min(10).max(10),
  description: z.string().min(10),
  apartment_type: z.enum(['dormitory', 'apartment']),
  apartment_location: z.enum(['asoke', 'prachauthit', 'phathumwan']),
  electric_price: z.number().min(0),
  water_price: z.number().min(0),
  internet: z.enum(['free', 'not_free', 'none']),
});
const ApartmentIdParam = z.object({
  id: z.string(),
});

const ApartmentFilterSchema = z.object({
  apartment_location: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
});

const createRoomSchema = z
  .object({
    name: z.string().min(2).max(255),
    type: z.string().min(2).max(255),
    size: z.number().min(0),
    price_start: z.number().min(0),
    price_end: z.number().min(0),
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
// For PATCH semantics we want an update schema where all fields are optional.
// Use the createRoomSchema as a base and call `.partial()` so callers can send
// only the fields they want to change. The price validation should only run
// when both prices are present in the payload.
const updateRoomSchema = createRoomSchema.partial().superRefine((data, ctx) => {
  if (data.price_start !== undefined && data.price_end !== undefined) {
    if (data.price_start >= data.price_end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'price_start must be less than price_end',
        path: ['price_start'],
      });
    }
  }
});
const RoomIdParam = z.object({
  id: z.string(),
});

export type createApartmentData = z.infer<typeof createApartmentSchema>;
export type updateApartmentData = z.infer<typeof updateApartmentSchema>;
export type createRoomData = z.infer<typeof createRoomSchema>;
export type updateRoomData = z.infer<typeof updateRoomSchema>;
export {
  createApartmentSchema,
  updateApartmentSchema,
  ApartmentIdParam,
  ApartmentFilterSchema,
  createRoomSchema,
  updateRoomSchema,
  RoomIdParam,
};
