import type { z } from 'zod';
import type { AddressSchemas } from '../schemas';

type Address = z.infer<typeof AddressSchemas.AddressSchema>;
type AddressList = z.infer<typeof AddressSchemas.AddressListSchema>;

export type { Address, AddressList };
