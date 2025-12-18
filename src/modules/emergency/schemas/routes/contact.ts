import {
  createDeleteRoute,
  createGetRoute,
  createPostRoute,
  createPutRoute,
} from '@/utils/openapi-helpers.ts';
import { ContactSchemas } from '@/modules/emergency/schemas';
import * as z from 'zod';

const createContactRoute = createPostRoute({
  path: 'emergency/contacts',
  summary: 'Create new contact',
  requestSchema: ContactSchemas.CreateContactSchema,
  responseSchema: ContactSchemas.ContactResponseSchema,
  tags: ['Report'],
});

const findContactByUserIdRoute = createGetRoute({
  path: 'emergency/contacts/{user_id}',
  summary: 'Find contact by userId',
  params: z.object({
    user_id: z.string(),
  }),
  responseSchema: ContactSchemas.FindContactByUserIdSchema,
  tags: ['Report'],
});

const updateContactByIdRoute = createPutRoute({
  path: 'emergency/contacts/{id}',
  summary: 'Update contact by id',
  params: z.object({
    id: z.string(),
  }),
  requestSchema: ContactSchemas.UpdateContactSchema,
  responseSchema: ContactSchemas.ContactResponseSchema,
  tags: ['Report'],
});

const deleteContactByIdRoute = createDeleteRoute({
  path: 'emergency/contacts/{id}',
  summary: 'Delete contact by id',
  params: z.object({
    id: z.string(),
  }),
  tags: ['Report'],
});
export {
  createContactRoute,
  findContactByUserIdRoute,
  updateContactByIdRoute,
  deleteContactByIdRoute,
};
