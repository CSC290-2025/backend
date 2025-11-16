import type { z } from 'zod';
import type { AddressSchemas } from '../schemas';

type Address = z.infer<typeof AddressSchemas.addressSchema>;
type createAddressData = z.infer<typeof AddressSchemas.createAddressSchema>;
type updateAddressData = z.infer<typeof AddressSchemas.updateAddressSchema>;

export type { Address, createAddressData, updateAddressData };
