import type { z } from 'zod';
import type { ownerSchemas } from '../schemas';

type apartmentOwner = z.infer<typeof ownerSchemas.ApartmentOwnerSchema>;
type user = z.infer<typeof ownerSchemas.UserSchema>;

export type { apartmentOwner, user };
