import type * as z from 'zod';
import type { ContactSchemas } from '@/modules/emergency/schemas';

type ContactResponse = z.infer<typeof ContactSchemas.ContactResponseSchema>;
type CreateContact = z.infer<typeof ContactSchemas.CreateContactSchema>;
type UpdateContact = z.infer<typeof ContactSchemas.UpdateContactSchema>;
type DeleteContactResponse = z.infer<
  typeof ContactSchemas.DeleteContactResponseSchema
>;

export type {
  CreateContact,
  ContactResponse,
  UpdateContact,
  DeleteContactResponse,
};
